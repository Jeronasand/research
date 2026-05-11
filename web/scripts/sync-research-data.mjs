import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const researchDir = path.join(repoRoot, "research");
const outputDir = path.join(repoRoot, "web/research-data");

const documentSpecs = [
  { file: "product.md", type: "product", language: "en" },
  { file: "product.zh-CN.md", type: "product", language: "zh-CN" },
  { file: "technical.md", type: "technical", language: "en" },
  { file: "technical.zh-CN.md", type: "technical", language: "zh-CN" },
];

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function extractVersion(markdown) {
  const english = markdown.match(/^Current version:\s*(.+)$/m);
  const chinese = markdown.match(/^当前版本:\s*(.+)$/m);
  return english?.[1]?.trim() || chinese?.[1]?.trim() || "unknown";
}

async function fileExists(file) {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const entries = await readdir(researchDir, { withFileTypes: true });
  const itemDirs = entries
    .filter((entry) => entry.isDirectory() && /^\d{4}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const items = [];

  await rm(outputDir, { force: true, recursive: true });
  await mkdir(outputDir, { recursive: true });

  for (const itemDir of itemDirs) {
    const sourceDir = path.join(researchDir, itemDir);
    const targetDir = path.join(outputDir, itemDir);
    await mkdir(targetDir, { recursive: true });

    for (const spec of documentSpecs) {
      const sourceFile = path.join(sourceDir, spec.file);
      if (!(await fileExists(sourceFile))) {
        continue;
      }

      const markdown = await readFile(sourceFile, "utf8");
      const key = `research-data/${itemDir}/${spec.file}`;
      await writeFile(path.join(targetDir, spec.file), markdown);
      items.push({
        id: `${itemDir}-${spec.type}-${spec.language}`,
        title: extractTitle(markdown, `${itemDir} ${spec.type}`),
        type: spec.type,
        language: spec.language,
        version: extractVersion(markdown),
        key,
      });
    }
  }

  const manifest = {
    title: "Research Repository",
    updated: new Date().toISOString().slice(0, 10),
    items,
  };
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${items.length} research documents to ${path.relative(repoRoot, outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
