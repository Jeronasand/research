import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ossPackageRoot, ossTargets, relativeFromRepo } from "./oss-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const webRoot = path.join(repoRoot, "web");
const webDist = path.join(webRoot, "dist");
const webResearchData = path.join(webRoot, "research-data");

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

async function main() {
  run("node", ["scripts/private-index.mjs"]);
  run("npm", ["run", "sync:data"], { cwd: webRoot });
  run("npm", ["run", "build"], { cwd: webRoot });

  await assertDirectory(webDist, "web build");
  await assertDirectory(webResearchData, "private content data");

  await rm(ossPackageRoot, { force: true, recursive: true });
  await mkdir(ossPackageRoot, { recursive: true });

  await copyDirectory(webDist, ossTargets.auth.localDir);
  await copyDirectory(webResearchData, ossTargets.content.localDir);

  const manifest = {
    schemaVersion: "research-oss-package/v1",
    generatedAt: new Date().toISOString(),
    targets: Object.fromEntries(
      await Promise.all(
        Object.entries(ossTargets).map(async ([key, target]) => [
          key,
          {
            label: target.label,
            bucket: target.bucket,
            endpoint: target.endpoint,
            region: target.region,
            ossUrl: target.ossUrl,
            localDir: relativeFromRepo(target.localDir),
            fileCount: await countFiles(target.localDir),
            verifyObject: target.verifyObject,
          },
        ]),
      ),
    ),
    commands: {
      dryRun: "npm run upload:oss -- --dry-run",
      uploadAll: "npm run upload:oss",
      uploadAuthOnly: "npm run upload:oss -- --target auth",
      uploadContentOnly: "npm run upload:oss -- --target content",
      verify: "npm run verify:oss",
    },
    safety: [
      "authorization/app shell bucket and private content bucket are packaged separately",
      "run dry-run before first upload or before enabling --delete",
      "content payload is uploaded under research-data/ in research-pages",
      "do not commit or package credentials, STS tokens, signed URLs, or session dumps",
    ],
  };

  await writeFile(path.join(ossPackageRoot, "upload-plan.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Packaged OSS payloads under ${relativeFromRepo(ossPackageRoot)}`);
  console.log(`- auth: ${relativeFromRepo(ossTargets.auth.localDir)} -> ${ossTargets.auth.ossUrl}`);
  console.log(`- content: ${relativeFromRepo(ossTargets.content.localDir)} -> ${ossTargets.content.ossUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
