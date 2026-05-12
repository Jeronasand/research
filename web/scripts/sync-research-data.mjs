import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  manifestFromPrivateIndex,
  PENDING_TASKS_PATH,
  PRIVATE_INDEX_PATH,
  writePrivateIndex,
} from "../../scripts/private-index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const outputDir = path.join(repoRoot, "web/research-data");

async function pathExists(file) {
  return Boolean(await stat(file).catch(() => null));
}

async function copyDirectory(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, {
    recursive: true,
    filter: (file) => path.basename(file) !== ".DS_Store",
  });
}

async function copyFileIfExists(sourcePath, targetPath) {
  const source = path.join(repoRoot, sourcePath);
  if (!(await pathExists(source))) {
    return;
  }
  const target = path.join(outputDir, targetPath.replace(/^research-data\/?/, ""));
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

async function copyResearchPackage(item) {
  const source = path.join(repoRoot, item.packagePath);
  const target = path.join(outputDir, item.objectPrefix.replace(/^research-data\/?/, ""));
  await copyDirectory(source, target);
}

async function main() {
  const privateIndex = await writePrivateIndex(repoRoot);
  const manifest = manifestFromPrivateIndex(privateIndex);
  const packageItems = [
    ...privateIndex.pendingTasks.filter((item) => item.entryKey && item.packagePath),
    ...privateIndex.inProgressResearch,
    ...privateIndex.completedResearch,
  ];

  await rm(outputDir, { force: true, recursive: true });
  await mkdir(outputDir, { recursive: true });

  for (const item of packageItems) {
    await copyResearchPackage(item);
  }

  await copyFileIfExists(PENDING_TASKS_PATH, `research-data/${PENDING_TASKS_PATH}`);
  await mkdir(path.join(outputDir, "research"), { recursive: true });
  await cp(path.join(repoRoot, PRIVATE_INDEX_PATH), path.join(outputDir, "research/private-index.json"));
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Wrote ${manifest.sections.length} sections, ${manifest.items.length} catalog items, and ${packageItems.length} preview packages to ${path.relative(repoRoot, outputDir)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
