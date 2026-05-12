import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  manifestFromPrivateIndex,
  PRIVATE_INDEX_PATH,
  writePrivateIndex,
} from "../../scripts/private-index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const outputDir = path.join(repoRoot, "web/research-data");
const copiedPackageDirs = new Set();

async function copyIndexedObject(item) {
  const source = path.join(repoRoot, item.sourcePath);
  const target = path.join(outputDir, item.objectKey.replace(/^research-data\/?/, ""));

  if (item.sourcePath.endsWith("/index.html")) {
    const sourceDir = path.dirname(source);
    const targetDir = path.dirname(target);
    if (!copiedPackageDirs.has(sourceDir)) {
      copiedPackageDirs.add(sourceDir);
      await mkdir(path.dirname(targetDir), { recursive: true });
      await cp(sourceDir, targetDir, {
        recursive: true,
        filter: (file) => path.basename(file) !== ".DS_Store",
      });
    }
    return;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

async function main() {
  const privateIndex = await writePrivateIndex(repoRoot);
  const manifest = manifestFromPrivateIndex(privateIndex);
  const items = [...privateIndex.researchDocuments, ...privateIndex.skillPages];

  await rm(outputDir, { force: true, recursive: true });
  await mkdir(outputDir, { recursive: true });

  for (const item of items) {
    await copyIndexedObject(item);
  }

  await mkdir(path.join(outputDir, "research"), { recursive: true });
  await cp(path.join(repoRoot, PRIVATE_INDEX_PATH), path.join(outputDir, "research/private-index.json"));
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Wrote ${manifest.items.length} private objects and manifest to ${path.relative(repoRoot, outputDir)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
