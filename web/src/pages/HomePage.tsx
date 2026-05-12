import {
  ChevronRight,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { renderMarkdown } from "../lib/markdown";
import {
  getSignedObjectText,
  parseManifest,
  type OssBucketConfig,
  type OssCredential,
  type ResearchDocumentItem,
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

type DirectoryTreeNode = {
  name: string;
  path: string;
  children: DirectoryTreeNode[];
  item?: ResearchDocumentItem;
};

const initialForm: FormState = {
  dataBucket: "research-datas",
  dataEndpoint: "oss-cn-beijing.aliyuncs.com",
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

function fieldValue(value: string) {
  return value.trim();
}

function fileNameFromKey(key: string) {
  if (!key) {
    return "(missing-key)";
  }
  return key.split("/").filter(Boolean).at(-1) ?? key;
}

function buildDirectoryTree(items: ResearchDocumentItem[]) {
  const root: DirectoryTreeNode = {
    name: "root",
    path: "",
    children: [],
  };

  for (const item of items) {
    const parts = (item.key || "").split("/").filter(Boolean);
    if (!parts.length) {
      continue;
    }
    let current = root;

    parts.forEach((part, index) => {
      const path = [current.path, part].filter(Boolean).join("/");
      let child = current.children.find((node) => node.name === part);

      if (!child) {
        child = {
          name: part,
          path,
          children: [],
        };
        current.children.push(child);
      }

      if (index === parts.length - 1) {
        child.item = item;
      }

      current = child;
    });
  }

  const sortNodes = (nodes: DirectoryTreeNode[]) => {
    nodes.sort((left, right) => {
      if (Boolean(left.item) !== Boolean(right.item)) {
        return left.item ? 1 : -1;
      }
      return left.name.localeCompare(right.name);
    });
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(root.children);
  return root.children;
}

function expandedPathsFromItems(items: ResearchDocumentItem[]) {
  const paths = new Set<string>();

  for (const item of items) {
    const parts = (item.key || "").split("/").filter(Boolean);
    if (!parts.length) {
      continue;
    }
    let path = "";

    parts.slice(0, -1).forEach((part) => {
      path = [path, part].filter(Boolean).join("/");
      paths.add(path);
    });
  }

  return paths;
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

function isHtmlDocument(item: ResearchDocumentItem | null) {
  return item?.format === "html" || item?.key.toLowerCase().endsWith(".html");
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

function DirectoryNodeView({
  node,
  depth,
  selectedId,
  expandedPaths,
  busy,
  onToggle,
  onSelect,
}: {
  node: DirectoryTreeNode;
  depth: number;
  selectedId: string;
  expandedPaths: Set<string>;
  busy: boolean;
  onToggle: (path: string) => void;
  onSelect: (item: ResearchDocumentItem) => void;
}) {
  const isFile = Boolean(node.item);
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = node.item?.id === selectedId;
  const paddingLeft = 10 + depth * 16;

  if (isFile && node.item) {
    return (
      <button
        type="button"
        onClick={() => onSelect(node.item as ResearchDocumentItem)}
        disabled={busy}
        style={{ paddingLeft }}
        className={[
          "grid w-full min-w-0 grid-cols-[16px_minmax(0,1fr)] items-start gap-2 rounded-md border px-2.5 py-2 text-left transition",
          "disabled:cursor-not-allowed disabled:opacity-55",
          isSelected
            ? "border-zinc-950 bg-zinc-950 text-white"
            : "border-transparent bg-white text-zinc-800 hover:border-zinc-200 hover:bg-zinc-100",
        ].join(" ")}
      >
        <FileText size={15} className={isSelected ? "mt-0.5 text-white" : "mt-0.5 text-zinc-500"} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{fileNameFromKey(node.item.key)}</span>
          <span className={["mt-0.5 block text-[11px]", isSelected ? "text-zinc-300" : "text-zinc-500"].join(" ")}>
            {node.item.type} / {node.item.language} / {node.item.version}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(node.path)}
        style={{ paddingLeft }}
        className="grid w-full grid-cols-[16px_16px_minmax(0,1fr)] items-center gap-2 rounded-md px-2.5 py-2 text-left text-zinc-800 hover:bg-zinc-100"
      >
        <ChevronRight
          size={14}
          className={["text-zinc-500 transition", isExpanded ? "rotate-90" : ""].join(" ")}
          aria-hidden="true"
        />
        {isExpanded ? (
          <FolderOpen size={15} className="text-zinc-700" aria-hidden="true" />
        ) : (
          <Folder size={15} className="text-zinc-700" aria-hidden="true" />
        )}
        <span className="truncate text-sm font-semibold">{node.name}</span>
      </button>
      {isExpanded ? (
        <div className="mt-1 grid gap-1">
          {node.children.map((child) => (
            <DirectoryNodeView
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedPaths={expandedPaths}
              busy={busy}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [authenticated, setAuthenticated] = useState(false);
  const [manifest, setManifest] = useState<ResearchManifest | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("请输入可读取 research-datas 私有数据桶的 OSS AK 或 STS 凭证。");
  const [busy, setBusy] = useState(false);

  const selectedItem = useMemo(
    () => manifest?.items.find((item) => item.id === selectedId) ?? null,
    [manifest, selectedId],
  );
  const directoryTree = useMemo(() => buildDirectoryTree(manifest?.items ?? []), [manifest]);

  function clearPreview(nextStatus?: string) {
    setAuthenticated(false);
    setManifest(null);
    setSelectedId("");
    setDocumentText("");
    setExpandedPaths(new Set());
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

  async function loadManifest(credential = credentialFromForm(form)) {
    const payload = await getSignedObjectText(
      bucketConfig(form.dataBucket, form.dataEndpoint),
      fieldValue(form.manifestKey),
      credential,
    );
    const nextManifest = parseManifest(payload);
    const nextSelectedId = nextManifest.items.find((item) => item.id === selectedId)?.id ?? nextManifest.items[0]?.id ?? "";

    setManifest(nextManifest);
    setSelectedId(nextSelectedId);
    setDocumentText("");
    setExpandedPaths(expandedPathsFromItems(nextManifest.items));
    return nextManifest;
  }

  async function loadDocumentContent(item: ResearchDocumentItem, credential = credentialFromForm(form)) {
    const payload = await getSignedObjectText(
      bucketConfig(form.dataBucket, form.dataEndpoint),
      item.key,
      credential,
    );

    setSelectedId(item.id);
    setDocumentText(payload);
  }

  async function validateDataBucketAccess() {
    setBusy(true);
    try {
      const credential = credentialFromForm(form);
      const nextManifest = await loadManifest(credential);
      setAuthenticated(true);
      if (nextManifest.items[0]) {
        await loadDocumentContent(nextManifest.items[0], credential);
        setStatus(`授权成功，正在预览：${nextManifest.items[0].title}`);
      } else {
        setStatus("授权成功，但目录清单里没有可预览文档。");
      }
    } catch (error) {
      clearPreview(error instanceof Error ? error.message : "数据桶授权失败。");
    } finally {
      setBusy(false);
    }
  }

  async function reloadManifest() {
    if (!authenticated) {
      setStatus("请先完成授权，再加载文档目录。");
      return;
    }

    setBusy(true);
    try {
      const credential = credentialFromForm(form);
      const nextManifest = await loadManifest(credential);
      const nextItem = nextManifest.items.find((item) => item.id === selectedId) ?? nextManifest.items[0];

      if (nextItem) {
        await loadDocumentContent(nextItem, credential);
        setStatus(`目录已刷新，正在预览：${nextItem.title}`);
      } else {
        setStatus("目录已刷新，但没有可预览文档。");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加载文档目录失败。");
    } finally {
      setBusy(false);
    }
  }

  async function loadDocument(item: ResearchDocumentItem | undefined) {
    if (!item || !authenticated) {
      return;
    }

    setBusy(true);
    try {
      await loadDocumentContent(item);
      setStatus(`正在预览：${item.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "文档加载失败。");
    } finally {
      setBusy(false);
    }
  }

  function toggleDirectory(path: string) {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  if (!authenticated) {
    return (
      <div className="mx-auto grid max-w-[440px] gap-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950">访问授权</h1>
              <p className="text-xs text-zinc-500">使用 OSS AK/STS 读取私有 HTML 调研文档和 skill</p>
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
            <ActionButton icon={<ShieldCheck size={16} aria-hidden="true" />} onClick={validateDataBucketAccess} disabled={busy}>
              授权并进入预览
            </ActionButton>
          </form>
        </div>
        <StatusLine status={status} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950">调研预览</h1>
              <p className="text-xs text-zinc-500">已授权读取私有 HTML 文档</p>
            </div>
            <ShieldCheck className="text-zinc-950" size={22} aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">目录</h2>
              <p className="text-xs text-zinc-500">{manifest?.items.length ?? 0} 个文档</p>
            </div>
            <FolderOpen size={18} className="text-zinc-800" aria-hidden="true" />
          </div>
          <div className="max-h-[calc(100vh-330px)] min-h-[220px] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-2">
            {directoryTree.length ? (
              <div className="grid gap-1">
                {directoryTree.map((node) => (
                  <DirectoryNodeView
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedId={selectedId}
                    expandedPaths={expandedPaths}
                    busy={busy}
                    onToggle={toggleDirectory}
                    onSelect={(item) => void loadDocument(item)}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 text-sm text-zinc-500">暂无目录。</p>
            )}
          </div>
        </div>

        <StatusLine status={status} />
      </section>

      <section className="min-w-0">
        <article className="min-w-0 rounded-md border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">{selectedItem?.title ?? "Preview"}</h2>
              <p className="mt-1 break-all text-xs text-zinc-500">
                {selectedItem?.key ?? manifest?.title ?? "Research data source"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600">
              <Eye size={14} aria-hidden="true" />
              {selectedItem?.version ?? "data source"}
            </span>
          </div>
          <div className="grid max-h-[calc(100vh-132px)] min-h-[calc(100vh-132px)] gap-4 overflow-auto px-5 py-5">
            {documentText ? (
              isHtmlDocument(selectedItem) ? (
                <iframe
                  title={selectedItem?.title ?? "HTML preview"}
                  srcDoc={documentText}
                  sandbox=""
                  className="h-[calc(100vh-184px)] w-full rounded-md border border-zinc-200 bg-white"
                />
              ) : (
                <div className="grid max-w-4xl gap-4">{renderMarkdown(documentText)}</div>
              )
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
                从左侧目录选择一个文档进行预览。
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
