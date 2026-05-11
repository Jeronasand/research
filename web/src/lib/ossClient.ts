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

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function canonicalResource(bucket: string, key: string) {
  const cleanKey = key.replace(/^\/+/, "");
  return cleanKey ? `/${bucket}/${cleanKey}` : `/${bucket}/`;
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

async function signedHeaders(method: "GET" | "HEAD", bucket: string, key: string, credential: OssCredential) {
  const ossDate = new Date().toUTCString();
  const ossHeaders: Record<string, string> = {
    "x-oss-date": ossDate,
  };

  if (credential.securityToken?.trim()) {
    ossHeaders["x-oss-security-token"] = credential.securityToken.trim();
  }

  const canonicalOssHeaders = Object.entries(ossHeaders)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}:${value}\n`)
    .join("");
  const stringToSign = [method, "", "", "", `${canonicalOssHeaders}${canonicalResource(bucket, key)}`].join("\n");
  const signature = await hmacSha1Base64(credential.accessKeySecret, stringToSign);

  return {
    ...ossHeaders,
    Authorization: `OSS ${credential.accessKeyId}:${signature}`,
  };
}

export function objectUrl(config: OssBucketConfig, key: string) {
  return `https://${config.bucket}.${normalizeEndpoint(config.endpoint)}/${encodeObjectKey(key.replace(/^\/+/, ""))}`;
}

export async function requestSignedObject(
  method: "GET" | "HEAD",
  config: OssBucketConfig,
  key: string,
  credential: OssCredential,
) {
  const cleanKey = key.replace(/^\/+/, "");
  const headers = await signedHeaders(method, config.bucket.trim(), cleanKey, credential);
  const response = await fetch(objectUrl(config, cleanKey), {
    method,
    headers,
  });

  if (!response.ok) {
    throw new Error(`${method} ${cleanKey} failed: ${response.status} ${response.statusText}`);
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
