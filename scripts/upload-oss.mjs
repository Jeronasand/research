import { stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { selectedTargets, relativeFromRepo } from "./oss-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

function parseArgs(argv) {
  const args = {
    target: "all",
    dryRun: false,
    delete: false,
    yes: false,
    skipPackage: false,
    profile: "",
    configFile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      args.target = argv[++index] || "";
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--delete") {
      args.delete = true;
    } else if (arg === "--yes") {
      args.yes = true;
    } else if (arg === "--skip-package") {
      args.skipPackage = true;
    } else if (arg === "--profile") {
      args.profile = argv[++index] || "";
    } else if (arg === "--config-file") {
      args.configFile = argv[++index] || "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
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
    throw new Error(`${label} package is missing: ${relativeFromRepo(dir)}. Run npm run package:oss first.`);
  }
}

function ossutilArgs(options, target) {
  const args = [
    "sync",
    target.localDir,
    target.ossUrl,
    "--endpoint",
    target.endpoint,
    "--region",
    target.region,
    "--exclude",
    ".DS_Store",
    "--exclude",
    "*/.DS_Store",
  ];

  if (options.dryRun) {
    args.push("--dry-run");
  }
  if (options.delete) {
    args.push("--delete");
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
  const targets = selectedTargets(options.target);

  if (options.delete && !options.yes) {
    throw new Error("Refusing --delete without --yes. Run a dry-run first, then pass --delete --yes deliberately.");
  }

  if (!options.skipPackage) {
    run("node", ["scripts/package-oss.mjs"]);
  }

  for (const target of targets) {
    await assertDirectory(target.localDir, target.label);
    console.log(`${options.dryRun ? "Dry-run" : "Uploading"} ${target.name}: ${relativeFromRepo(target.localDir)} -> ${target.ossUrl}`);
    run("ossutil", ossutilArgs(options, target));
  }

  if (!options.dryRun) {
    run("node", ["scripts/verify-oss.mjs", "--target", options.target]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
