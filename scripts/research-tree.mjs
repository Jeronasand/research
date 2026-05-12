import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const categories = ["待调研", "调研中", "调研完成"];

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
export const repoRoot = path.resolve(scriptDir, "..");
export const researchDir = path.join(repoRoot, "research");
export const treePath = path.join(repoRoot, "tree.json");

async function exists(file) {
  return Boolean(await stat(file).catch(() => null));
}

async function assertDirectory(dir, label) {
  const info = await stat(dir).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(`${label} directory is missing: ${path.relative(repoRoot, dir)}`);
  }
}

function sortNodes(nodes) {
  return nodes.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
}

async function listDirectoryNodes(basePath, relativePath = "") {
  const entries = await readdir(basePath, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }

    const localPath = path.join(basePath, entry.name);
    const nodePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const entryHtml = path.join(localPath, "index.html");

    if (await exists(entryHtml)) {
      nodes.push({
        type: "package",
        name: entry.name,
        path: nodePath,
      });
    } else {
      nodes.push({
        type: "folder",
        name: entry.name,
        path: nodePath,
        children: await listDirectoryNodes(localPath, nodePath),
      });
    }
  }

  return sortNodes(nodes);
}

export async function buildTree() {
  await assertDirectory(researchDir, "research");

  const tree = {};
  for (const category of categories) {
    const categoryPath = path.join(researchDir, category);
    tree[category] = (await exists(categoryPath)) ? await listDirectoryNodes(categoryPath) : [];
  }

  return tree;
}

async function validateRequiredDirectories() {
  const errors = [];

  for (const category of categories) {
    const categoryPath = path.join(researchDir, category);
    const info = await stat(categoryPath).catch(() => null);
    if (!info?.isDirectory()) {
      errors.push(`research/${category}: category directory is missing`);
    }
  }

  return errors;
}

export async function writeTree(tree = null) {
  const nextTree = tree || await buildTree();
  await writeFile(treePath, `${JSON.stringify(nextTree, null, 2)}\n`);
  return nextTree;
}

export async function readTree() {
  return JSON.parse(await readFile(treePath, "utf8"));
}

function stableJson(value) {
  return JSON.stringify(value, null, 2);
}

function validateNodeShape(node, category, parentPath, errors) {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    errors.push(`${category}/${parentPath}: node must be an object`);
    return;
  }

  if (node.type !== "package" && node.type !== "folder") {
    errors.push(`${category}/${node.path || parentPath}: invalid type "${node.type}"`);
  }

  if (typeof node.name !== "string" || !node.name.trim()) {
    errors.push(`${category}/${node.path || parentPath}: name is required`);
  }

  if (typeof node.path !== "string" || !node.path.trim()) {
    errors.push(`${category}/${node.name || parentPath}: path is required`);
    return;
  }

  if (node.path.startsWith("/") || node.path.includes("..")) {
    errors.push(`${category}/${node.path}: path must be relative and cannot contain ".."`);
  }

  const expectedPrefix = parentPath ? `${parentPath}/` : "";
  if (!node.path.startsWith(expectedPrefix)) {
    errors.push(`${category}/${node.path}: path must be under ${category}/${parentPath || ""}`);
  }

  if (node.type === "package" && "children" in node) {
    errors.push(`${category}/${node.path}: package node must not include children`);
  }

  if (node.type === "folder") {
    if (!Array.isArray(node.children)) {
      errors.push(`${category}/${node.path}: folder node must include children array`);
      return;
    }

    for (const child of node.children) {
      validateNodeShape(child, category, node.path, errors);
    }
  }
}

function validateTreeShape(tree) {
  const errors = [];

  if (!tree || typeof tree !== "object" || Array.isArray(tree)) {
    return ["tree.json must be an object"];
  }

  for (const category of categories) {
    if (!Array.isArray(tree[category])) {
      errors.push(`${category}: category must be an array`);
      continue;
    }

    for (const node of tree[category]) {
      validateNodeShape(node, category, "", errors);
    }
  }

  for (const key of Object.keys(tree)) {
    if (!categories.includes(key)) {
      errors.push(`${key}: unknown category`);
    }
  }

  return errors;
}

export function findFirstPackage(nodes) {
  for (const node of nodes) {
    if (node?.type === "package" && node.path) {
      return node;
    }

    const childPackage = findFirstPackage(Array.isArray(node?.children) ? node.children : []);
    if (childPackage) {
      return childPackage;
    }
  }

  return null;
}

export async function validateTreeFile() {
  const currentTree = await readTree();
  const generatedTree = await buildTree();
  const errors = [
    ...await validateRequiredDirectories(),
    ...validateTreeShape(currentTree),
  ];

  if (stableJson(currentTree) !== stableJson(generatedTree)) {
    errors.push("tree.json is out of sync with research/; run npm run tree");
  }

  return {
    ok: errors.length === 0,
    errors,
    currentTree,
    generatedTree,
  };
}

function printUsage() {
  console.log(`Usage:
  node scripts/research-tree.mjs generate
  node scripts/research-tree.mjs validate
  node scripts/research-tree.mjs print

Commands:
  generate   Generate tree.json from research/
  validate   Validate tree.json shape and sync with research/
  print      Print generated tree without writing tree.json`);
}

async function runCli() {
  const command = process.argv[2] || "generate";

  if (command === "-h" || command === "--help") {
    printUsage();
    return;
  }

  if (command === "generate") {
    const tree = await writeTree();
    console.log(`Generated tree.json: ${JSON.stringify(tree)}`);
    return;
  }

  if (command === "validate") {
    const result = await validateTreeFile();
    if (!result.ok) {
      for (const error of result.errors) {
        console.error(`Error: ${error}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("tree.json is valid and in sync with research/");
    return;
  }

  if (command === "print") {
    console.log(JSON.stringify(await buildTree(), null, 2));
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
