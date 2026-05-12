import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

export const PRIVATE_INDEX_PATH = "research/private-index.json";
export const DATA_PREFIX = "research-data";
export const PENDING_TASKS_PATH = "research/pending/tasks.json";

const dualBucketAccess = {
  previewBucket: "research-preview",
  previewEndpoint: "oss-cn-shenzhen.aliyuncs.com",
  dataBucket: "research-pages",
  dataEndpoint: "oss-cn-shenzhen.aliyuncs.com",
  manifestKey: `${DATA_PREFIX}/manifest.json`,
  mode: "pure-static-browser-ak-sts",
  authPage: "Use the web authorization screen directly.",
};

const sectionDefinitions = [
  {
    id: "pending",
    title: "待调研",
    description: "手动维护 tasks.json，用来沉淀待启动的调研任务。",
  },
  {
    id: "in-progress",
    title: "调研中",
    description: "每个子目录是一个正在产出的静态 Web 调研包。",
  },
  {
    id: "completed",
    title: "已完结调研",
    description: "每个子目录是一个已完成并可预览的静态 Web 调研包。",
  },
];

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

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function stringValue(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
}

async function normalizeTask(root, raw, index) {
  const item = raw && typeof raw === "object" ? raw : {};
  const id = stringValue(item.id, `pending-${index + 1}`);
  const packagePath = stringValue(item.packagePath, sourcePath("research", "pending", id));
  const packageRoot = path.join(root, packagePath);
  const metadata = (await readJsonIfExists(path.join(packageRoot, "research.json"))) || {};
  const entryFile = stringValue(item.entry || metadata.entry, "index.html");
  const entrySourcePath = sourcePath(packagePath, entryFile);
  let preview = {};

  try {
    const html = await readFile(path.join(root, entrySourcePath), "utf8");
    const meta = metaLineFromHtml(html);
    preview = {
      language: stringValue(item.language || metadata.language || meta.language, "zh-CN"),
      version: stringValue(item.version || metadata.version || meta.version || meta.current_version, "html"),
      format: "html",
      packagePath,
      sourcePath: entrySourcePath,
      entryKey: objectKeyFor(entrySourcePath),
      objectPrefix: objectKeyFor(packagePath),
    };
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return {
    id,
    title: stringValue(item.title || metadata.title, id),
    kind: "pending-task",
    sectionId: "pending",
    sectionTitle: "待调研",
    status: "pending",
    priority: stringValue(item.priority, "P2"),
    summary: stringValue(item.summary || metadata.summary),
    request: stringValue(item.request),
    expectedOutput: stringValue(item.expectedOutput),
    targetPath: stringValue(item.targetPath),
    owner: stringValue(item.owner),
    createdAt: stringValue(item.createdAt || metadata.createdAt),
    updatedAt: stringValue(item.updatedAt || metadata.updatedAt),
    tags: stringArray(item.tags?.length ? item.tags : metadata.tags),
    inputs: Array.isArray(item.inputs) ? item.inputs.filter((input) => input && typeof input === "object") : [],
    ...preview,
  };
}

async function buildPendingTasks(root) {
  const payload = await readJsonIfExists(path.join(root, PENDING_TASKS_PATH));
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  const tasks = [];
  for (const [index, item] of items.entries()) {
    tasks.push(await normalizeTask(root, item, index));
  }
  return tasks;
}

async function buildResearchPackages(root, sectionId, sectionTitle) {
  const sectionDir = path.join(root, "research", sectionId);
  const entries = await safeReadDir(sectionDir, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const packages = [];
  for (const dir of dirs) {
    const packagePath = sourcePath("research", sectionId, dir);
    const packageRoot = path.join(root, packagePath);
    const metadata = (await readJsonIfExists(path.join(packageRoot, "research.json"))) || {};
    const entryFile = stringValue(metadata.entry, "index.html");
    const entrySourcePath = sourcePath(packagePath, entryFile);
    let html;

    try {
      html = await readFile(path.join(root, entrySourcePath), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const meta = metaLineFromHtml(html);
    packages.push({
      id: stringValue(metadata.id, dir),
      title: stringValue(metadata.title, titleFromHtml(html, dir)),
      kind: "research-package",
      sectionId,
      sectionTitle,
      status: sectionId === "completed" ? "completed" : "in-progress",
      priority: stringValue(metadata.priority),
      summary: stringValue(metadata.summary),
      owner: stringValue(metadata.owner),
      createdAt: stringValue(metadata.createdAt),
      updatedAt: stringValue(metadata.updatedAt || meta.updated_at || meta.last_verified_at),
      tags: stringArray(metadata.tags),
      language: stringValue(metadata.language || meta.language, "zh-CN"),
      version: stringValue(metadata.version || meta.version || meta.current_version, "html"),
      format: "html",
      packagePath,
      sourcePath: entrySourcePath,
      entryKey: objectKeyFor(entrySourcePath),
      objectPrefix: objectKeyFor(packagePath),
    });
  }

  return packages;
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

function section(id, items) {
  const definition = sectionDefinitions.find((item) => item.id === id);
  return {
    id,
    title: definition.title,
    description: definition.description,
    count: items.length,
    items,
  };
}

export async function buildPrivateIndex(root = repoRoot) {
  const [pendingTasks, inProgressResearch, completedResearch, skillPages] = await Promise.all([
    buildPendingTasks(root),
    buildResearchPackages(root, "in-progress", "调研中"),
    buildResearchPackages(root, "completed", "已完结调研"),
    buildSkillPages(root),
  ]);

  const sections = [
    section("pending", pendingTasks),
    section("in-progress", inProgressResearch),
    section("completed", completedResearch),
  ];

  return {
    schemaVersion: "research-private-index/v2",
    generatedAt: new Date().toISOString(),
    repository: {
      visibility: "private",
      roots: {
        externalInbox: "temptodo/",
        pendingTasks: PENDING_TASKS_PATH,
        pendingResearchPackages: "research/pending/<task-id>/index.html",
        inProgressResearch: "research/in-progress/*/index.html",
        completedResearch: "research/completed/*/index.html",
        skillHtml: "skills/*/index.html",
      },
      excludedRoots: ["temptodo/"],
    },
    dualBucketAccess,
    rules: [
      "The preview catalog has three top-level sections: pending, in-progress, and completed.",
      "Pending research tasks are hand-maintained in research/pending/tasks.json.",
      "A pending task can optionally expose a preview package at research/pending/<task-id>/index.html or task.packagePath.",
      "In-progress and completed research entries are direct child directories with an index.html entrypoint.",
      "Each research package keeps its local assets beside its index.html.",
      "The public preview bucket only serves the authorization/app shell.",
      "The private content bucket stores the generated manifest and research package payloads.",
    ],
    sections,
    pendingTasks,
    inProgressResearch,
    completedResearch,
    skillPages,
  };
}

export function manifestFromPrivateIndex(index) {
  const toManifestItem = (item) => ({
    id: item.id,
    title: item.title,
    kind: item.kind,
    sectionId: item.sectionId,
    sectionTitle: item.sectionTitle,
    status: item.status,
    priority: item.priority || "",
    summary: item.summary || "",
    request: item.request || "",
    expectedOutput: item.expectedOutput || "",
    targetPath: item.targetPath || "",
    owner: item.owner || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    tags: item.tags || [],
    inputs: item.inputs || [],
    language: item.language || "zh-CN",
    version: item.version || "",
    format: item.format || "",
    packagePath: item.packagePath || "",
    sourcePath: item.sourcePath || "",
    entryKey: item.entryKey || "",
    objectPrefix: item.objectPrefix || "",
  });

  const sections = index.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    count: section.items.length,
    items: section.items.map(toManifestItem),
  }));

  return {
    schemaVersion: "research-preview-manifest/v2",
    title: "Research Private Repository",
    updated: new Date().toISOString().slice(0, 10),
    privateIndexKey: objectKeyFor(PRIVATE_INDEX_PATH),
    sections,
    items: sections.flatMap((section) => section.items),
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
      console.log(
        `Wrote ${PRIVATE_INDEX_PATH}: ${index.pendingTasks.length} pending tasks, ${index.inProgressResearch.length} in-progress packages, ${index.completedResearch.length} completed packages`,
      );
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
