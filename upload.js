import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.dirname(__filename);

const categories = ["待调研", "调研中", "调研完成"];
const researchDir = path.join(repoRoot, "research");
const previewDir = path.join(repoRoot, "preview");
const treePath = path.join(repoRoot, "tree.json");

const defaults = {
  endpoint: process.env.OSS_ENDPOINT || "oss-cn-shenzhen.aliyuncs.com",
  region: process.env.OSS_REGION || "cn-shenzhen",
  previewBucket: process.env.PREVIEW_BUCKET || "research-preview",
  datasBucket: process.env.DATAS_BUCKET || "research-pages",
  profile: process.env.OSS_PROFILE || "",
  configFile: process.env.OSS_CONFIG_FILE || "",
};

function parseArgs(argv) {
  const options = {
    dryRun: false,
    cleanData: false,
    uploadPreview: false,
    treeOnly: false,
    ...defaults,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--clean-data") {
      options.cleanData = true;
    } else if (arg === "--preview") {
      options.uploadPreview = true;
    } else if (arg === "--tree-only") {
      options.treeOnly = true;
    } else if (arg === "--endpoint") {
      options.endpoint = argv[++index] || "";
    } else if (arg === "--region") {
      options.region = argv[++index] || "";
    } else if (arg === "--preview-bucket") {
      options.previewBucket = argv[++index] || "";
    } else if (arg === "--datas-bucket") {
      options.datasBucket = argv[++index] || "";
    } else if (arg === "--profile") {
      options.profile = argv[++index] || "";
    } else if (arg === "--config-file") {
      options.configFile = argv[++index] || "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function ossutilGlobalArgs(options) {
  const args = ["--endpoint", options.endpoint, "--region", options.region];
  if (options.profile) {
    args.push("--profile", options.profile);
  }
  if (options.configFile) {
    args.push("--config-file", options.configFile);
  }
  if (options.dryRun) {
    args.push("--dry-run");
  }
  return args;
}

function runOssutil(args, options) {
  const result = spawnSync("ossutil", [...args, ...ossutilGlobalArgs(options)], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`ossutil ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function exists(file) {
  return Boolean(await stat(file).catch(() => null));
}

async function listProjects(category) {
  const categoryPath = path.join(researchDir, category);
  if (!(await exists(categoryPath))) {
    return [];
  }

  const entries = await readdir(categoryPath, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }

    const entryHtml = path.join(categoryPath, entry.name, "index.html");
    if (await exists(entryHtml)) {
      projects.push(entry.name);
    } else {
      console.warn(`Skip ${category}/${entry.name}: missing index.html`);
    }
  }

  return projects.sort((left, right) => left.localeCompare(right, "zh-CN"));
}

async function generateTree() {
  const tree = {};
  for (const category of categories) {
    tree[category] = await listProjects(category);
  }

  await writeFile(treePath, `${JSON.stringify(tree, null, 2)}\n`);
  console.log(`Generated tree.json: ${JSON.stringify(tree)}`);
  return tree;
}

async function assertDirectory(dir, label) {
  const info = await stat(dir).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(`${label} directory is missing: ${path.relative(repoRoot, dir)}`);
  }
}

function cleanDataBucket(options) {
  console.log(`${options.dryRun ? "Dry-run clean" : "Cleaning"} datas bucket: oss://${options.datasBucket}/`);
  runOssutil(["rm", `oss://${options.datasBucket}/`, "--recursive", "--force"], options);
}

function uploadData(options) {
  console.log(`${options.dryRun ? "Dry-run upload" : "Uploading"} research/ -> oss://${options.datasBucket}/research/`);
  runOssutil([
    "sync",
    researchDir,
    `oss://${options.datasBucket}/research/`,
    "--exclude",
    ".DS_Store",
    "--exclude",
    "*/.DS_Store",
    "--exclude",
    ".gitkeep",
    "--force",
  ], options);

  console.log(`${options.dryRun ? "Dry-run upload" : "Uploading"} tree.json -> oss://${options.datasBucket}/tree.json`);
  runOssutil(["cp", treePath, `oss://${options.datasBucket}/tree.json`, "--force"], options);
}

async function uploadPreview(options) {
  await assertDirectory(previewDir, "preview");
  console.log(`${options.dryRun ? "Dry-run upload" : "Uploading"} preview/ -> oss://${options.previewBucket}/`);
  runOssutil([
    "sync",
    previewDir,
    `oss://${options.previewBucket}/`,
    "--delete",
    "--cache-control",
    "no-cache, no-store, must-revalidate",
    "--exclude",
    ".DS_Store",
    "--exclude",
    "*/.DS_Store",
    "--force",
  ], options);
}

function verify(options, tree) {
  if (options.dryRun) {
    return;
  }

  runOssutil(["stat", `oss://${options.datasBucket}/tree.json`], options);
  const firstCategory = categories.find((category) => tree[category]?.length);
  if (firstCategory) {
    runOssutil([
      "stat",
      `oss://${options.datasBucket}/research/${firstCategory}/${tree[firstCategory][0]}/index.html`,
    ], options);
  }

  if (options.uploadPreview) {
    runOssutil(["stat", `oss://${options.previewBucket}/login.html`], options);
    runOssutil(["stat", `oss://${options.previewBucket}/index.html`], options);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  await assertDirectory(researchDir, "research");
  const tree = await generateTree();
  if (options.treeOnly) {
    return;
  }

  if (options.cleanData) {
    cleanDataBucket(options);
  }

  uploadData(options);
  if (options.uploadPreview) {
    await uploadPreview(options);
  }

  verify(options, tree);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
