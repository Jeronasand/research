export type OssCredential = {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken?: string;
};

export type OssBucketConfig = {
  bucket: string;
  endpoint: string;
};

export type ResearchDocumentItem = {
  id: string;
  title: string;
  type: "product" | "technical" | "overview";
  language: "en" | "zh-CN";
  version: string;
  key: string;
};

export type ResearchManifest = {
  title: string;
  updated: string;
  items: ResearchDocumentItem[];
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

export async function getPublicObjectText(config: OssBucketConfig, key: string) {
  const response = await fetch(objectUrl(config, key.replace(/^\/+/, "")));
  if (!response.ok) {
    throw new Error(`GET ${key} failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export function parseManifest(payload: string): ResearchManifest {
  const parsed = JSON.parse(payload) as ResearchManifest;
  if (!Array.isArray(parsed.items)) {
    throw new Error("Manifest is missing items[]");
  }
  return parsed;
}
