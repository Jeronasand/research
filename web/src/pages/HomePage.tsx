import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  getSignedObjectText,
  getSignedObjectUrl,
  parseManifest,
  type OssBucketConfig,
  type OssCredential,
  type ResearchCatalogItem,
  type ResearchCatalogSection,
  type ResearchManifest,
} from "../lib/ossClient";

type FormState = {
  dataBucket: string;
  dataEndpoint: string;
  manifestKey: string;
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
};

const initialForm: FormState = {
  dataBucket: "research-pages",
  dataEndpoint: "oss-cn-shenzhen.aliyuncs.com",
  manifestKey: "research-data/manifest.json",
  accessKeyId: "",
  accessKeySecret: "",
  securityToken: "",
};

const authorizationFieldNames = new Set<keyof FormState>([
  "dataBucket",
  "dataEndpoint",
  "manifestKey",
  "accessKeyId",
  "accessKeySecret",
  "securityToken",
]);

const CREDENTIAL_STORAGE_KEY = "research-preview:oss-credentials:v1";

function fieldValue(value: string) {
  return value.trim();
}

function storedString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readRememberedCredentials() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const payload = window.localStorage.getItem(CREDENTIAL_STORAGE_KEY);
    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(payload) as { form?: Partial<Record<keyof FormState, unknown>> };
    const storedForm = parsed.form ?? {};
    const form: FormState = {
      dataBucket: storedString(storedForm.dataBucket, initialForm.dataBucket),
      dataEndpoint: storedString(storedForm.dataEndpoint, initialForm.dataEndpoint),
      manifestKey: storedString(storedForm.manifestKey, initialForm.manifestKey),
      accessKeyId: storedString(storedForm.accessKeyId),
      accessKeySecret: storedString(storedForm.accessKeySecret),
      securityToken: storedString(storedForm.securityToken),
    };

    return form.accessKeyId && form.accessKeySecret ? form : null;
  } catch {
    return null;
  }
}

function rememberCredentials(form: FormState) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      CREDENTIAL_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        form,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

function forgetRememberedCredentials() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
  } catch {
    // Authorization can still continue for this session if storage fails.
  }
}

function credentialFromForm(form: FormState): OssCredential {
  return {
    accessKeyId: fieldValue(form.accessKeyId),
    accessKeySecret: fieldValue(form.accessKeySecret),
    securityToken: fieldValue(form.securityToken) || undefined,
  };
}

function bucketConfig(bucket: string, endpoint: string): OssBucketConfig {
  return {
    bucket: fieldValue(bucket),
    endpoint: fieldValue(endpoint),
  };
}

function statusLabel(status: ResearchCatalogItem["status"]) {
  if (status === "completed") return "已完结";
  if (status === "in-progress") return "调研中";
  return "待调研";
}

function sectionIcon(sectionId: ResearchCatalogSection["id"]) {
  if (sectionId === "completed") return <CheckCircle2 size={18} aria-hidden="true" />;
  if (sectionId === "in-progress") return <Clock3 size={18} aria-hidden="true" />;
  return <ClipboardList size={18} aria-hidden="true" />;
}

function isLocalPreviewReference(reference: string) {
  const value = reference.trim();
  return Boolean(value) && !value.startsWith("#") && !value.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(value);
}

function objectKeyFromRelativeReference(baseKey: string, reference: string) {
  if (!isLocalPreviewReference(reference)) {
    return null;
  }

  const hashIndex = reference.indexOf("#");
  const queryIndex = reference.indexOf("?");
  const endIndex = Math.min(
    ...[hashIndex, queryIndex].filter((index) => index !== -1),
    reference.length,
  );
  const pathPart = reference.slice(0, endIndex);
  if (!pathPart) {
    return null;
  }

  const hash = hashIndex === -1 ? "" : reference.slice(hashIndex);
  const baseDir = baseKey.split("/").slice(0, -1).join("/");
  const resolved = new URL(pathPart, `https://research-preview.local/${baseDir}/`);
  const key = decodeURIComponent(resolved.pathname.replace(/^\/+/, ""));
  return { key, hash };
}

function textToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function contentTypeFromKey(key: string) {
  if (key.endsWith(".json")) return "application/json";
  if (key.endsWith(".css")) return "text/css";
  if (key.endsWith(".js")) return "text/javascript";
  if (key.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

async function replaceAsync(
  source: string,
  pattern: RegExp,
  replacer: (match: RegExpMatchArray) => Promise<string>,
) {
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(pattern)) {
    parts.push(source.slice(lastIndex, match.index));
    parts.push(await replacer(match));
    lastIndex = (match.index ?? 0) + match[0].length;
  }

  parts.push(source.slice(lastIndex));
  return parts.join("");
}

async function rewriteHtmlForPrivatePreview(
  html: string,
  item: ResearchCatalogItem,
  activeForm: FormState,
  credential: OssCredential,
) {
  const config = bucketConfig(activeForm.dataBucket, activeForm.dataEndpoint);
  const signedUrlCache = new Map<string, Promise<string>>();
  const dataUrlCache = new Map<string, Promise<string>>();

  const signedUrlFor = (key: string) => {
    if (!signedUrlCache.has(key)) {
      signedUrlCache.set(key, getSignedObjectUrl(config, key, credential));
    }
    return signedUrlCache.get(key) as Promise<string>;
  };

  const dataUrlFor = (key: string) => {
    if (!dataUrlCache.has(key)) {
      dataUrlCache.set(
        key,
        getSignedObjectText(config, key, credential).then((payload) => {
          const type = contentTypeFromKey(key);
          return `data:${type};base64,${textToBase64(payload)}`;
        }),
      );
    }
    return dataUrlCache.get(key) as Promise<string>;
  };

  const withSignedAttributes = await replaceAsync(
    html,
    /\b(src|href)=(["'])([^"']+)\2/gi,
    async (match) => {
      const attribute = match[1];
      const quote = match[2];
      const reference = match[3];
      const resolved = objectKeyFromRelativeReference(item.entryKey, reference);
      if (!resolved) {
        return match[0];
      }

      const signedUrl = `${await signedUrlFor(resolved.key)}${resolved.hash}`;
      return `${attribute}=${quote}${signedUrl}${quote}`;
    },
  );

  return replaceAsync(withSignedAttributes, /\bfetch\(\s*(["'])([^"']+)\1/g, async (match) => {
    const reference = match[2];
    const resolved = objectKeyFromRelativeReference(item.entryKey, reference);
    if (!resolved) {
      return match[0];
    }

    return `fetch(${JSON.stringify(await dataUrlFor(resolved.key))}`;
  });
}

function StatusLine({ status }: { status: string }) {
  return (
    <div className="min-h-9 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm">
      {status}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

function ActionButton({
  children,
  icon,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary"
          ? "bg-zinc-950 text-white hover:bg-zinc-800"
          : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
      ].join(" ")}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function RememberCredentialsToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-950"
      />
      <span>
        <span className="block font-medium text-zinc-800">记住 AK/SK 并自动登录</span>
        <span className="block text-xs text-zinc-500">仅保存在当前浏览器。</span>
      </span>
    </label>
  );
}

function CatalogItemCard({
  item,
  busy,
  onOpen,
}: {
  item: ResearchCatalogItem;
  busy: boolean;
  onOpen: (item: ResearchCatalogItem) => void;
}) {
  const canOpen = item.kind === "research-package" && Boolean(item.entryKey);
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-950">{item.title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{statusLabel(item.status)}</p>
        </div>
        <span className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
          {item.priority || item.version || item.format || "item"}
        </span>
      </div>
      {item.summary ? <p className="line-clamp-3 text-sm leading-6 text-zinc-600">{item.summary}</p> : null}
      {item.request ? <p className="line-clamp-2 text-xs leading-5 text-zinc-500">{item.request}</p> : null}
      {item.tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto break-all text-xs text-zinc-400">{item.packagePath || item.targetPath || item.id}</div>
    </>
  );

  if (!canOpen) {
    return (
      <div className="grid min-h-[168px] gap-3 rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      disabled={busy}
      className="grid min-h-[168px] gap-3 rounded-md border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-zinc-950 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
    >
      {body}
    </button>
  );
}

function CatalogSectionView({
  section,
  busy,
  onOpen,
}: {
  section: ResearchCatalogSection;
  busy: boolean;
  onOpen: (item: ResearchCatalogItem) => void;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900">
            {sectionIcon(section.id)}
          </span>
          <div>
            <h2 className="text-base font-semibold text-zinc-950">{section.title}</h2>
            <p className="text-xs text-zinc-500">{section.description}</p>
          </div>
        </div>
        <span className="text-xs text-zinc-500">{section.items.length} 项</span>
      </div>
      {section.items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {section.items.map((item) => (
            <CatalogItemCard key={`${section.id}-${item.id}`} item={item} busy={busy} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
          暂无条目。
        </div>
      )}
    </section>
  );
}

function PendingTaskSpec() {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-base font-semibold text-zinc-950">待调研 JSON 字段规范</h2>
        <p className="text-xs text-zinc-500">维护 `research/pending/tasks.json`，前端会按这些字段生成待调研卡片。</p>
      </div>
      <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2 font-semibold">字段</th>
              <th className="border-b border-zinc-200 px-3 py-2 font-semibold">要求</th>
              <th className="border-b border-zinc-200 px-3 py-2 font-semibold">说明</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700">
            {[
              ["id", "必填", "小写 slug，唯一，例如 asksurf-api-research"],
              ["title", "必填", "卡片标题"],
              ["priority", "建议", "P0 / P1 / P2"],
              ["summary", "建议", "一句话背景"],
              ["request", "建议", "你希望调研回答的问题"],
              ["expectedOutput", "建议", "期望产物，例如 产品调研 HTML + 技术调研 HTML"],
              ["targetPath", "建议", "后续静态包目录，例如 research/in-progress/<id>/"],
              ["tags", "可选", "字符串数组"],
              ["inputs", "可选", "输入材料数组：type / label / path / url / note"],
              ["owner", "可选", "负责人"],
              ["createdAt / updatedAt", "可选", "YYYY-MM-DD"],
            ].map((row) => (
              <tr key={row[0]} className="odd:bg-white even:bg-zinc-50">
                <td className="border-b border-zinc-100 px-3 py-2 font-medium text-zinc-950">{row[0]}</td>
                <td className="border-b border-zinc-100 px-3 py-2">{row[1]}</td>
                <td className="border-b border-zinc-100 px-3 py-2">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function HomePage() {
  const [rememberedForm] = useState<FormState | null>(() => readRememberedCredentials());
  const autoLoginStarted = useRef(false);
  const [form, setForm] = useState<FormState>(() => rememberedForm ?? initialForm);
  const [rememberSavedCredentials, setRememberSavedCredentials] = useState(() => Boolean(rememberedForm));
  const [authenticated, setAuthenticated] = useState(false);
  const [manifest, setManifest] = useState<ResearchManifest | null>(null);
  const [selectedItem, setSelectedItem] = useState<ResearchCatalogItem | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [status, setStatus] = useState("请输入可读取 research-pages 私有数据桶的 OSS AK 或 STS 凭证。");
  const [busy, setBusy] = useState(false);

  const totalItems = useMemo(() => manifest?.sections.reduce((sum, section) => sum + section.items.length, 0) ?? 0, [manifest]);

  function clearPreview(nextStatus?: string) {
    setAuthenticated(false);
    setManifest(null);
    setSelectedItem(null);
    setPreviewHtml("");
    if (nextStatus) {
      setStatus(nextStatus);
    }
  }

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (authorizationFieldNames.has(key) && authenticated) {
      clearPreview("访问凭证已变更，请重新授权后继续预览。");
    }
  }

  function updateRememberSavedCredentials(checked: boolean) {
    setRememberSavedCredentials(checked);
    if (!checked) {
      forgetRememberedCredentials();
      setStatus("已清除本机保存的 OSS 凭证。");
    }
  }

  function forgetSavedCredentials(nextStatus = "已清除本机保存的 OSS 凭证。") {
    forgetRememberedCredentials();
    setRememberSavedCredentials(false);
    setStatus(nextStatus);
  }

  async function loadManifest(activeForm = form, credential = credentialFromForm(activeForm)) {
    const payload = await getSignedObjectText(
      bucketConfig(activeForm.dataBucket, activeForm.dataEndpoint),
      fieldValue(activeForm.manifestKey),
      credential,
    );
    const nextManifest = parseManifest(payload);

    setManifest(nextManifest);
    setSelectedItem(null);
    setPreviewHtml("");
    return nextManifest;
  }

  async function openResearchPackage(item: ResearchCatalogItem, activeForm = form, credential = credentialFromForm(activeForm)) {
    if (!item.entryKey) {
      setStatus("这个条目还没有可预览的静态包。");
      return;
    }

    setBusy(true);
    try {
      const payload = await getSignedObjectText(
        bucketConfig(activeForm.dataBucket, activeForm.dataEndpoint),
        item.entryKey,
        credential,
      );
      const rewritten = await rewriteHtmlForPrivatePreview(payload, item, activeForm, credential);
      setSelectedItem(item);
      setPreviewHtml(rewritten);
      setStatus(`正在预览：${item.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "文档加载失败。");
    } finally {
      setBusy(false);
    }
  }

  async function validateDataBucketAccess(
    activeForm = form,
    options: { auto?: boolean; remember?: boolean } = {},
  ) {
    setBusy(true);
    try {
      const credential = credentialFromForm(activeForm);
      const nextManifest = await loadManifest(activeForm, credential);
      const shouldRemember = options.remember ?? rememberSavedCredentials;
      let rememberStatus = "";

      if (shouldRemember) {
        rememberStatus = rememberCredentials(activeForm) ? "，已保存本机凭证" : "，但浏览器未能保存凭证";
      } else {
        forgetRememberedCredentials();
      }

      setAuthenticated(true);
      setStatus(`${options.auto ? "自动登录成功" : "授权成功"}${rememberStatus}，请选择一个调研卡片。共 ${nextManifest.items.length} 项。`);
    } catch (error) {
      clearPreview(
        options.auto
          ? `自动登录失败，请重新输入凭证：${error instanceof Error ? error.message : "数据桶授权失败。"}`
          : error instanceof Error
            ? error.message
            : "数据桶授权失败。",
      );
    } finally {
      setBusy(false);
    }
  }

  async function reloadManifest() {
    if (!authenticated) {
      setStatus("请先完成授权，再加载目录。");
      return;
    }

    setBusy(true);
    try {
      const credential = credentialFromForm(form);
      const nextManifest = await loadManifest(form, credential);
      setStatus(`目录已刷新，共 ${nextManifest.items.length} 项。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加载目录失败。");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!rememberedForm || autoLoginStarted.current) {
      return;
    }

    autoLoginStarted.current = true;
    setStatus("已读取本机保存的 OSS 凭证，正在自动授权。");
    void validateDataBucketAccess(rememberedForm, { auto: true, remember: true });
    // Run once on mount to consume the saved credential snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authenticated) {
    return (
      <div className="mx-auto grid max-w-[440px] gap-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950">访问授权</h1>
              <p className="text-xs text-zinc-500">使用 OSS AK/STS 读取私有调研目录</p>
            </div>
            <KeyRound className="text-zinc-950" size={22} aria-hidden="true" />
          </div>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void validateDataBucketAccess();
            }}
          >
            <TextField label="AccessKeyId" value={form.accessKeyId} onChange={(value) => updateForm("accessKeyId", value)} />
            <TextField
              label="AccessKeySecret"
              type="password"
              autoComplete="new-password"
              value={form.accessKeySecret}
              onChange={(value) => updateForm("accessKeySecret", value)}
            />
            <TextField
              label="STS SecurityToken"
              type="password"
              autoComplete="new-password"
              value={form.securityToken}
              onChange={(value) => updateForm("securityToken", value)}
            />
            <RememberCredentialsToggle checked={rememberSavedCredentials} onChange={updateRememberSavedCredentials} />
            <ActionButton
              icon={<ShieldCheck size={16} aria-hidden="true" />}
              onClick={() => void validateDataBucketAccess()}
              disabled={busy}
            >
              授权并进入预览
            </ActionButton>
          </form>
        </div>
        <StatusLine status={status} />
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setPreviewHtml("");
                setStatus("已返回目录。");
              }}
              className="mb-3 inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              返回目录
            </button>
            <h1 className="text-lg font-semibold text-zinc-950">{selectedItem.title}</h1>
            <p className="mt-1 break-all text-xs text-zinc-500">{selectedItem.packagePath || selectedItem.entryKey}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600">
            <Eye size={14} aria-hidden="true" />
            {statusLabel(selectedItem.status)}
          </span>
        </div>
        <article className="min-w-0 rounded-md border border-zinc-200 bg-white shadow-sm">
          {previewHtml ? (
            <iframe
              title={selectedItem.title}
              srcDoc={previewHtml}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              className="h-[calc(100vh-210px)] min-h-[520px] w-full rounded-md border-0 bg-white"
            />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-zinc-500">正在加载。</div>
          )}
        </article>
        <StatusLine status={status} />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950">调研目录</h1>
          <p className="text-xs text-zinc-500">按待调研、调研中、已完结调研三个目录索引。共 {totalItems} 项。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<RefreshCw size={16} aria-hidden="true" />} onClick={reloadManifest} disabled={busy}>
            刷新目录
          </ActionButton>
          <ActionButton
            icon={<KeyRound size={16} aria-hidden="true" />}
            onClick={() => clearPreview("已退出授权，请重新授权后继续预览。")}
            disabled={busy}
            variant="secondary"
          >
            退出
          </ActionButton>
          <ActionButton
            icon={<Trash2 size={16} aria-hidden="true" />}
            onClick={() => forgetSavedCredentials()}
            disabled={busy || !rememberSavedCredentials}
            variant="secondary"
          >
            忘记凭证
          </ActionButton>
        </div>
      </div>

      {manifest?.sections.map((section) => (
        <CatalogSectionView
          key={section.id}
          section={section}
          busy={busy}
          onOpen={(item) => void openResearchPackage(item)}
        />
      ))}

      <PendingTaskSpec />
      <StatusLine status={status} />
    </div>
  );
}
