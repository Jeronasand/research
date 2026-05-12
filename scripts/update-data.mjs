import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ossTargets, relativeFromRepo } from "./oss-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const webRoot = path.join(repoRoot, "web");
const webResearchData = path.join(webRoot, "research-data");
const contentTarget = ossTargets.content;

function parseArgs(argv) {
  const options = {
    dryRun: false,
    packageOnly: false,
    delete: false,
    yes: false,
    profile: "",
    configFile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--package-only") {
      options.packageOnly = true;
    } else if (arg === "--delete") {
      options.delete = true;
    } else if (arg === "--yes") {
      options.yes = true;
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

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function assertDirectory(dir, label) {
  const info = await stat(dir).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(`${label} directory is missing: ${relativeFromRepo(dir)}`);
  }
}

async function countFiles(dir) {
  let count = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += await countFiles(fullPath);
    } else if (entry.isFile()) {
      count += 1;
    }
  }
  return count;
}

async function copyDirectory(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, {
    recursive: true,
    filter: (file) => path.basename(file) !== ".DS_Store",
  });
}

function uploadArgs(options) {
  const args = ["scripts/upload-oss.mjs", "--target", "content", "--skip-package"];

  if (options.dryRun) {
    args.push("--dry-run");
  }
  if (options.delete) {
    args.push("--delete");
  }
  if (options.yes) {
    args.push("--yes");
  }
  if (options.profile) {
    args.push("--profile", options.profile);
  }
  if (options.configFile) {
    args.push("--config-file", options.configFile);
  }

  return args;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  run("npm", ["run", "sync:data"], { cwd: webRoot });
  await assertDirectory(webResearchData, "private content data");

  await rm(contentTarget.localDir, { force: true, recursive: true });
  await copyDirectory(webResearchData, contentTarget.localDir);

  const fileCount = await countFiles(contentTarget.localDir);
  console.log(`Packaged data payload: ${relativeFromRepo(contentTarget.localDir)} (${fileCount} files)`);

  if (options.packageOnly) {
    return;
  }

  run("node", uploadArgs(options));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
