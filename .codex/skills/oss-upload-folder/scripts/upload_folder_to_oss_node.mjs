#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillDir = path.resolve(__dirname, "..");
const envPath = path.join(skillDir, ".env.oss-upload-folder");

function loadSkillEnv(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function usage() {
  console.log(`Usage:
  upload_folder_to_oss_node.mjs --local-dir <path> --oss-url <oss://bucket/prefix/> [--oss-url <oss://bucket2/prefix/> ...] [options]

Required:
  --local-dir <path>      Local directory to upload
  --oss-url <url>         Destination OSS URL, repeatable, e.g. oss://example-bucket/site/

Optional:
  --dry-run               Preview files without uploading
  --endpoint <endpoint>   OSS endpoint override
  --region <region>       OSS region override
  -h, --help              Show this help

Environment:
  Loads .env.oss-upload-folder from the skill directory only.
  Requires OSS_NODE_ACCESS_KEY_ID, OSS_NODE_ACCESS_KEY_SECRET, and region/endpoint.
  Requires the target project to install ali-oss.`);
}

function parseArgs(argv) {
  const out = { dryRun: false, ossUrls: [] };
  if (process.env.OSS_NODE_DEFAULT_URL) out.ossUrls.push(process.env.OSS_NODE_DEFAULT_URL);
  if (process.env.OSS_NODE_DEFAULT_URLS) {
    out.ossUrls.push(...process.env.OSS_NODE_DEFAULT_URLS.split(/[,\s]+/).filter(Boolean));
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--local-dir") out.localDir = argv[++i];
    else if (arg === "--oss-url") out.ossUrls.push(argv[++i]);
    else if (arg === "--endpoint") out.endpoint = argv[++i];
    else if (arg === "--region") out.region = argv[++i];
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "-h" || arg === "--help") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return out;
}

function parseOssUrl(url) {
  if (!url || !url.startsWith("oss://")) throw new Error("--oss-url must start with oss://");
  const rest = url.slice("oss://".length);
  const slash = rest.indexOf("/");
  const bucket = slash === -1 ? rest : rest.slice(0, slash);
  let prefix = slash === -1 ? "" : rest.slice(slash + 1);
  if (!bucket) throw new Error("OSS bucket is required");
  if (!prefix) throw new Error("bucket-root upload is blocked; use an explicit prefix");
  if (!prefix.endsWith("/")) prefix += "/";
  return { bucket, prefix };
}

function listFiles(root) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  walk(root);
  return files;
}

loadSkillEnv(envPath);

let options;
try {
  options = parseArgs(process.argv.slice(2));
  if (!options.localDir || options.ossUrls.length === 0) throw new Error("--local-dir and at least one --oss-url are required");
} catch (error) {
  console.error(`Error: ${error.message}`);
  usage();
  process.exit(1);
}

const localDir = path.resolve(options.localDir);
if (!fs.existsSync(localDir) || !fs.statSync(localDir).isDirectory()) {
  console.error(`Error: local directory does not exist: ${localDir}`);
  process.exit(1);
}

let targets;
try {
  targets = options.ossUrls.filter(Boolean).map(parseOssUrl);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const region = options.region || process.env.OSS_NODE_REGION;
const endpoint = options.endpoint || process.env.OSS_NODE_ENDPOINT;
const accessKeyId = process.env.OSS_NODE_ACCESS_KEY_ID;
const accessKeySecret = process.env.OSS_NODE_ACCESS_KEY_SECRET;
const files = listFiles(localDir);

console.log(`Local dir : ${localDir}`);
console.log(`Targets   : ${targets.map((target) => `oss://${target.bucket}/${target.prefix}`).join(" ")}`);
console.log(`Files     : ${files.length}`);
console.log(`Mode      : ${options.dryRun ? "dry-run" : "upload"}`);

if (options.dryRun) {
  for (const target of targets) {
    for (const file of files) {
      const rel = path.relative(localDir, file).split(path.sep).join("/");
      console.log(`DRY-RUN ${rel} -> oss://${target.bucket}/${target.prefix}${rel}`);
    }
  }
  process.exit(0);
}

if (!accessKeyId || !accessKeySecret || (!region && !endpoint)) {
  console.error("Error: fill OSS_NODE_ACCESS_KEY_ID, OSS_NODE_ACCESS_KEY_SECRET, and OSS_NODE_REGION or OSS_NODE_ENDPOINT in .env.oss-upload-folder.");
  process.exit(1);
}

let OSS;
try {
  const mod = await import("ali-oss");
  OSS = mod.default || mod;
} catch {
  console.error("Error: Node.js implementation requires ali-oss. Install it in the target project with: npm install ali-oss");
  process.exit(1);
}

for (const target of targets) {
  const client = new OSS({
    accessKeyId,
    accessKeySecret,
    bucket: target.bucket,
    region,
    endpoint,
  });

  for (const file of files) {
    const rel = path.relative(localDir, file).split(path.sep).join("/");
    const objectName = `${target.prefix}${rel}`;
    console.log(`Uploading ${rel} -> oss://${target.bucket}/${objectName}`);
    await client.put(objectName, file);
  }
}

console.log("Done.");
