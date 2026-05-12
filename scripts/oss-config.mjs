import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

export const ossPackageRoot = path.join(repoRoot, "dist/oss");

export const ossTargets = {
  auth: {
    name: "auth",
    label: "authorization/app shell bucket",
    bucket: "research-preview",
    endpoint: "oss-cn-shenzhen.aliyuncs.com",
    region: "cn-shenzhen",
    ossUrl: "oss://research-preview/",
    localDir: path.join(ossPackageRoot, "auth-bucket"),
    verifyObject: "index.html",
  },
  content: {
    name: "content",
    label: "private content bucket",
    bucket: "research-datas",
    endpoint: "oss-cn-beijing.aliyuncs.com",
    region: "cn-beijing",
    ossUrl: "oss://research-datas/research-data/",
    localDir: path.join(ossPackageRoot, "content-bucket/research-data"),
    verifyObject: "research-data/manifest.json",
  },
};

export function selectedTargets(target = "all") {
  if (target === "all") {
    return [ossTargets.auth, ossTargets.content];
  }
  if (!ossTargets[target]) {
    throw new Error(`Unknown target "${target}". Use auth, content, or all.`);
  }
  return [ossTargets[target]];
}

export function relativeFromRepo(file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}
