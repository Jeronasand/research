import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

export const PRIVATE_INDEX_PATH = "research/private-index.json";
export const DATA_PREFIX = "research-data";

const dualBucketAccess = {
  previewBucket: "research-preview",
  previewEndpoint: "oss-cn-shenzhen.aliyuncs.com",
  dataBucket: "research-datas",
  dataEndpoint: "oss-cn-beijing.aliyuncs.com",
  manifestKey: `${DATA_PREFIX}/manifest.json`,
  mode: "pure-static-browser-ak-sts",
  authPage: "Use the OSS dual-bucket access HTML skill or the web/ authorization screen directly.",
};

function sourcePath(...parts) {
  return path.join(...parts).split(path.sep).join("/");
}

function objectKeyFor(source) {
  return `${DATA_PREFIX}/${source}`;
}

function stripTags(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function titleFromHtml(html, fallback) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : fallback;
}

function metaLineFromHtml(html) {
  const match = html.match(/<p[^>]*class=["'][^"']*\bmeta\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  if (!match) {
    return {};
  }

  return stripTags(match[1])
    .split("|")
    .map((part) => part.trim())
    .reduce((meta, part) => {
      const index = part.indexOf(":");
      if (index === -1) {
        return meta;
      }
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      if (key && value) {
        meta[key] = value;
      }
      return meta;
    }, {});
}

function skillContextFromHtml(html) {
  const match = html.match(
    /<script[^>]*id=["']skillgenome-ai-context["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

async function safeReadDir(dir, options) {
  try {
    return await readdir(dir, options);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function buildResearchDocuments(root) {
  const researchDir = path.join(root, "research");
  const entries = await safeReadDir(researchDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
  const packageDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "pending")
    .map((entry) => entry.name)
    .sort();

  const documents = [];
  for (const file of htmlFiles) {
    const relativePath = sourcePath("research", file);
    const html = await readFile(path.join(root, relativePath), "utf8");
    const meta = metaLineFromHtml(html);
    const slug = file.replace(/\.html$/i, "");

    documents.push({
      id: slug,
      title: titleFromHtml(html, slug),
      kind: "research-document",
      type: "research",
      format: "html",
      language: meta.language || "zh-CN",
      version: meta.version || meta.current_version || "html",
      status: meta.status || "published",
      scope: meta.scope || slug,
      lastVerifiedAt: meta.last_verified_at || "",
      sourcePath: relativePath,
      objectKey: objectKeyFor(relativePath),
    });
  }

  for (const dir of packageDirs) {
    const relativePath = sourcePath("research", dir, "index.html");
    let html;
    try {
      html = await readFile(path.join(root, relativePath), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const meta = metaLineFromHtml(html);
    documents.push({
      id: dir,
      title: titleFromHtml(html, dir),
      kind: "research-document",
      type: "research",
      format: "html",
      language: meta.language || "zh-CN",
      version: meta.version || meta.current_version || "html",
      status: meta.status || "published",
      scope: meta.scope || dir,
      lastVerifiedAt: meta.last_verified_at || "",
      sourcePath: relativePath,
      objectKey: objectKeyFor(relativePath),
    });
  }

  return documents;
}

async function buildSkillPages(root) {
  const skillsDir = path.join(root, "skills");
  const entries = await safeReadDir(skillsDir, { withFileTypes: true });
  const skillDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const pages = [];
  for (const dir of skillDirs) {
    const relativePath = sourcePath("skills", dir, "index.html");
    let html;
    try {
      html = await readFile(path.join(root, relativePath), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const context = skillContextFromHtml(html) || {};
    pages.push({
      id: context.id || dir,
      title: context.title || titleFromHtml(html, dir),
      kind: "skill-page",
      type: "skill",
      format: "html",
      language: "zh-CN",
      version: context.version || "html",
      status: "active",
      updatedAt: context.updatedAt || "",
      sourceRepository: context.sourceRepository || context.repository || null,
      sourcePath: relativePath,
      objectKey: objectKeyFor(relativePath),
    });
  }

  return pages;
}

async function buildPendingResearch(root) {
  const pendingDir = path.join(root, "research", "pending");
  const entries = await safeReadDir(pendingDir, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const pending = [];
  for (const dir of dirs) {
    const readmePath = sourcePath("research", "pending", dir, "README.md");
    let title = dir;
    try {
      const readme = await readFile(path.join(root, readmePath), "utf8");
      title = readme.match(/^#\s+(.+)$/m)?.[1]?.trim() || dir;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    pending.push({
      id: dir,
      title,
      kind: "pending-research",
      status: "pending",
      sourcePath: sourcePath("research", "pending", dir),
    });
  }

  return pending;
}

export async function buildPrivateIndex(root = repoRoot) {
  const [researchDocuments, skillPages, pendingResearch] = await Promise.all([
    buildResearchDocuments(root),
    buildSkillPages(root),
    buildPendingResearch(root),
  ]);

  return {
    schemaVersion: "research-private-index/v1",
    generatedAt: new Date().toISOString(),
    repository: {
      visibility: "private",
      roots: {
        externalInbox: "temptodo/",
        researchHtml: "research/*.html",
        researchPackages: "research/*/index.html",
        pendingResearch: "research/pending/*/",
        skillHtml: "skills/*/index.html",
      },
      excludedRoots: ["temptodo/"],
    },
    dualBucketAccess,
    rules: [
      "Research deliverables are HTML files under research/ or packaged pages under research/<topic>/index.html.",
      "External Web or HTML files and webpage folders stay in temptodo/ until the user explicitly asks to sync.",
      "When syncing a webpage folder, preserve the entry HTML and local assets together in the classified target folder.",
      "Pending research topics live in their own directories under research/pending/.",
      "Skills may be HTML pages under skills/<skill-id>/index.html.",
      "The public preview bucket only serves the authorization/app shell.",
      "Private research and skill HTML are indexed and uploaded to the private data bucket.",
    ],
    researchDocuments,
    skillPages,
    pendingResearch,
  };
}

export function manifestFromPrivateIndex(index) {
  const toManifestItem = (item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    language: item.language || "zh-CN",
    version: item.version || "html",
    format: item.format || "html",
    key: item.objectKey,
    sourcePath: item.sourcePath,
  });

  return {
    title: "Research Private Repository",
    updated: new Date().toISOString().slice(0, 10),
    privateIndexKey: objectKeyFor(PRIVATE_INDEX_PATH),
    items: [...index.researchDocuments, ...index.skillPages].map(toManifestItem),
  };
}

export async function writePrivateIndex(root = repoRoot) {
  const index = await buildPrivateIndex(root);
  const target = path.join(root, PRIVATE_INDEX_PATH);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

if (path.resolve(process.argv[1] || "") === __filename) {
  writePrivateIndex()
    .then((index) => {
      const documentCount = index.researchDocuments.length;
      const skillCount = index.skillPages.length;
      const pendingCount = index.pendingResearch.length;
      console.log(
        `Wrote ${PRIVATE_INDEX_PATH}: ${documentCount} research HTML, ${skillCount} skill HTML, ${pendingCount} pending items`,
      );
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
