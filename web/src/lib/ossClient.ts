export type OssCredential = {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken?: string;
};

export type OssBucketConfig = {
  bucket: string;
  endpoint: string;
};

export type ResearchCatalogInput = {
  type?: string;
  label?: string;
  path?: string;
  url?: string;
  note?: string;
};

export type ResearchCatalogItem = {
  id: string;
  title: string;
  kind: "pending-task" | "research-package";
  sectionId: "pending" | "in-progress" | "completed";
  sectionTitle: string;
  status: "pending" | "in-progress" | "completed";
  priority: string;
  summary: string;
  request: string;
  expectedOutput: string;
  targetPath: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  inputs: ResearchCatalogInput[];
  language: "en" | "zh-CN";
  version: string;
  format: "html" | "";
  packagePath: string;
  sourcePath: string;
  entryKey: string;
  objectPrefix: string;
};

export type ResearchCatalogSection = {
  id: "pending" | "in-progress" | "completed";
  title: string;
  description: string;
  count: number;
  items: ResearchCatalogItem[];
};

export type ResearchManifest = {
  title: string;
  updated: string;
  sections: ResearchCatalogSection[];
  items: ResearchCatalogItem[];
};

type RawManifestItem = Partial<ResearchCatalogItem> & {
  key?: unknown;
};

const encoder = new TextEncoder();
const SIGNED_URL_EXPIRES_SECONDS = 300;
const SIGNABLE_SUBRESOURCES = new Set(["security-token"]);

function requireCredential(credential: OssCredential) {
  if (!credential.accessKeyId.trim() || !credential.accessKeySecret.trim()) {
    throw new Error("AccessKeyId and AccessKeySecret are required.");
  }
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function canonicalSubresourceString(params: Record<string, string>) {
  const entries = Object.entries(params)
    .filter(([key]) => SIGNABLE_SUBRESOURCES.has(key))
    .sort(([left], [right]) => left.localeCompare(right));

  if (!entries.length) {
    return "";
  }

  return `?${entries.map(([key, value]) => (value ? `${key}=${value}` : key)).join("&")}`;
}

function canonicalResource(bucket: string, key: string, params: Record<string, string> = {}) {
  const cleanKey = key.replace(/^\/+/, "");
  const resource = cleanKey ? `/${bucket}/${cleanKey}` : `/${bucket}/`;
  return `${resource}${canonicalSubresourceString(params)}`;
}

async function hmacSha1Base64(secret: string, payload: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  const bytes = new Uint8Array(signature);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function signedObjectUrl(config: OssBucketConfig, key: string, credential: OssCredential) {
  requireCredential(credential);

  const cleanKey = key.replace(/^\/+/, "");
  const bucket = config.bucket.trim();
  const expires = String(Math.floor(Date.now() / 1000) + SIGNED_URL_EXPIRES_SECONDS);
  const signedParams: Record<string, string> = {};
  const securityToken = credential.securityToken?.trim();

  if (securityToken) {
    signedParams["security-token"] = securityToken;
  }

  const stringToSign = ["GET", "", "", expires, canonicalResource(bucket, cleanKey, signedParams)].join("\n");
  const signature = await hmacSha1Base64(credential.accessKeySecret, stringToSign);
  const url = new URL(objectUrl(config, cleanKey));

  if (securityToken) {
    url.searchParams.set("security-token", securityToken);
  }
  url.searchParams.set("OSSAccessKeyId", credential.accessKeyId.trim());
  url.searchParams.set("Expires", expires);
  url.searchParams.set("Signature", signature);

  return url.toString();
}

export async function getSignedObjectUrl(config: OssBucketConfig, key: string, credential: OssCredential) {
  return signedObjectUrl(config, key, credential);
}

function xmlTag(payload: string, tag: string) {
  return payload.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1]?.trim();
}

function ossErrorDetail(payload: string) {
  const code = xmlTag(payload, "Code");
  const message = xmlTag(payload, "Message");
  const requestId = xmlTag(payload, "RequestId");
  return [code, message, requestId ? `RequestId ${requestId}` : ""].filter(Boolean).join(": ");
}

async function responseErrorMessage(method: "GET", key: string, response: Response) {
  const payload = await response.text().catch(() => "");
  const detail = payload ? ossErrorDetail(payload) : "";
  return `${method} ${key} failed: ${response.status} ${response.statusText}${detail ? ` (${detail})` : ""}`;
}

export function objectUrl(config: OssBucketConfig, key: string) {
  return `https://${config.bucket}.${normalizeEndpoint(config.endpoint)}/${encodeObjectKey(key.replace(/^\/+/, ""))}`;
}

export async function requestSignedObject(
  method: "GET",
  config: OssBucketConfig,
  key: string,
  credential: OssCredential,
) {
  const cleanKey = key.replace(/^\/+/, "");
  const response = await fetch(await signedObjectUrl(config, cleanKey, credential), { method });

  if (!response.ok) {
    throw new Error(await responseErrorMessage(method, cleanKey, response));
  }

  return response;
}

export async function getSignedObjectText(config: OssBucketConfig, key: string, credential: OssCredential) {
  const response = await requestSignedObject("GET", config, key, credential);
  return response.text();
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
}

function normalizeSectionId(value: unknown): ResearchCatalogSection["id"] {
  return value === "pending" || value === "in-progress" || value === "completed" ? value : "pending";
}

function sectionTitle(sectionId: ResearchCatalogSection["id"]) {
  if (sectionId === "in-progress") return "调研中";
  if (sectionId === "completed") return "已完结调研";
  return "待调研";
}

function normalizeStatus(value: unknown, sectionId: ResearchCatalogSection["id"]): ResearchCatalogItem["status"] {
  if (value === "pending" || value === "in-progress" || value === "completed") {
    return value;
  }
  return sectionId === "completed" ? "completed" : sectionId === "in-progress" ? "in-progress" : "pending";
}

function normalizeInputs(value: unknown): ResearchCatalogInput[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const input = item as ResearchCatalogInput;
      return {
        type: stringValue(input.type),
        label: stringValue(input.label),
        path: stringValue(input.path),
        url: stringValue(input.url),
        note: stringValue(input.note),
      };
    });
}

function normalizeItem(raw: unknown, index: number): ResearchCatalogItem {
  const item = (raw ?? {}) as RawManifestItem;
  const sectionId = normalizeSectionId(item.sectionId);
  const kind = item.kind === "research-package" ? "research-package" : "pending-task";
  const id = stringValue(item.id, `${sectionId}-${index + 1}`);
  return {
    id,
    title: stringValue(item.title, id),
    kind,
    sectionId,
    sectionTitle: stringValue(item.sectionTitle, sectionTitle(sectionId)),
    status: normalizeStatus(item.status, sectionId),
    priority: stringValue(item.priority),
    summary: stringValue(item.summary),
    request: stringValue(item.request),
    expectedOutput: stringValue(item.expectedOutput),
    targetPath: stringValue(item.targetPath),
    owner: stringValue(item.owner),
    createdAt: stringValue(item.createdAt),
    updatedAt: stringValue(item.updatedAt),
    tags: stringArray(item.tags),
    inputs: normalizeInputs(item.inputs),
    language: item.language === "en" || item.language === "zh-CN" ? item.language : "zh-CN",
    version: stringValue(item.version),
    format: item.format === "html" ? "html" : "",
    packagePath: stringValue(item.packagePath),
    sourcePath: stringValue(item.sourcePath),
    entryKey: stringValue(item.entryKey || item.key),
    objectPrefix: stringValue(item.objectPrefix),
  };
}

function normalizeSection(raw: unknown): ResearchCatalogSection {
  const section = (raw ?? {}) as Partial<ResearchCatalogSection>;
  const id = normalizeSectionId(section.id);
  const items = Array.isArray(section.items) ? section.items.map((item, itemIndex) => normalizeItem(item, itemIndex)) : [];
  return {
    id,
    title: stringValue(section.title, sectionTitle(id)),
    description: stringValue(section.description),
    count: typeof section.count === "number" ? section.count : items.length,
    items,
  };
}

export function parseManifest(payload: string): ResearchManifest {
  const parsed = JSON.parse(payload) as {
    title?: unknown;
    updated?: unknown;
    sections?: unknown;
    items?: unknown;
  };

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((section) => normalizeSection(section))
    : [
        {
          id: "completed" as const,
          title: "已完结调研",
          description: "",
          count: Array.isArray(parsed.items) ? parsed.items.length : 0,
          items: Array.isArray(parsed.items) ? parsed.items.map((item, index) => normalizeItem(item, index)) : [],
        },
      ];

  return {
    title: stringValue(parsed.title, "Research Repository"),
    updated: stringValue(parsed.updated),
    sections,
    items: sections.flatMap((section) => section.items),
  };
}
