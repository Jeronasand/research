import { Database, Eye, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { renderMarkdown } from "../lib/markdown";
import {
  getSignedObjectText,
  parseManifest,
  requestSignedObject,
  type OssBucketConfig,
  type OssCredential,
  type ResearchDocumentItem,
  type ResearchManifest,
} from "../lib/ossClient";

type FormState = {
  loginBucket: string;
  loginEndpoint: string;
  loginProbeKey: string;
  dataBucket: string;
  dataEndpoint: string;
  manifestKey: string;
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
};

const initialForm: FormState = {
  loginBucket: "research-preview",
  loginEndpoint: "oss-cn-shenzhen.aliyuncs.com",
  loginProbeKey: "auth/session.json",
  dataBucket: "research-datas",
  dataEndpoint: "oss-cn-beijing.aliyuncs.com",
  manifestKey: "research-data/manifest.json",
  accessKeyId: "",
  accessKeySecret: "",
  securityToken: "",
};

const loginFieldNames = new Set<keyof FormState>([
  "loginBucket",
  "loginEndpoint",
  "loginProbeKey",
  "accessKeyId",
  "accessKeySecret",
  "securityToken",
]);

function fieldValue(value: string) {
  return value.trim();
}

function credentialFromLogin(form: FormState): OssCredential {
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

function StatusLine({ status }: { status: string }) {
  return (
    <div className="min-h-9 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password";
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
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
          ? "bg-emerald-700 text-white hover:bg-emerald-800"
          : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
      ].join(" ")}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [authenticated, setAuthenticated] = useState(false);
  const [manifest, setManifest] = useState<ResearchManifest | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState("Validate the login bucket to continue.");
  const [busy, setBusy] = useState(false);

  const selectedItem = useMemo(
    () => manifest?.items.find((item) => item.id === selectedId) ?? manifest?.items[0],
    [manifest, selectedId],
  );

  function clearPreview(nextStatus?: string) {
    setAuthenticated(false);
    setManifest(null);
    setSelectedId("");
    setMarkdown("");
    if (nextStatus) {
      setStatus(nextStatus);
    }
  }

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (loginFieldNames.has(key) && authenticated) {
      clearPreview("Login settings changed. Validate the login bucket again.");
    }
  }

  async function loadManifest(credential = credentialFromLogin(form)) {
    const payload = await getSignedObjectText(
      bucketConfig(form.dataBucket, form.dataEndpoint),
      fieldValue(form.manifestKey),
      credential,
    );
    const nextManifest = parseManifest(payload);
    setManifest(nextManifest);
    setSelectedId(nextManifest.items[0]?.id ?? "");
    setMarkdown("");
  }

  async function validateLoginBucket() {
    setBusy(true);
    try {
      const credential = credentialFromLogin(form);
      await requestSignedObject(
        "HEAD",
        bucketConfig(form.loginBucket, form.loginEndpoint),
        fieldValue(form.loginProbeKey),
        credential,
      );
      setAuthenticated(true);
      await loadManifest(credential);
      setStatus("Login bucket validated. Loaded data source.");
    } catch (error) {
      clearPreview(error instanceof Error ? error.message : "Login validation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reloadManifest() {
    if (!authenticated) {
      setStatus("Validate the login bucket before loading the data source.");
      return;
    }

    setBusy(true);
    try {
      await loadManifest();
      setStatus("Reloaded data source.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Data bucket manifest failed.");
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
      const payload = await getSignedObjectText(
        bucketConfig(form.dataBucket, form.dataEndpoint),
        item.key,
        credentialFromLogin(form),
      );
      setSelectedId(item.id);
      setMarkdown(payload);
      setStatus(`Loaded ${item.title}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Document load failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto grid max-w-[440px] gap-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950">Login Bucket</h1>
              <p className="text-xs text-zinc-500">OSS AK/STS session validation</p>
            </div>
            <KeyRound className="text-emerald-700" size={22} aria-hidden="true" />
          </div>
          <div className="grid gap-3">
            <TextField label="Bucket" value={form.loginBucket} onChange={(value) => updateForm("loginBucket", value)} />
            <TextField label="Endpoint" value={form.loginEndpoint} onChange={(value) => updateForm("loginEndpoint", value)} />
            <TextField label="Probe object key" value={form.loginProbeKey} onChange={(value) => updateForm("loginProbeKey", value)} />
            <TextField label="AccessKeyId" value={form.accessKeyId} onChange={(value) => updateForm("accessKeyId", value)} />
            <TextField label="AccessKeySecret" type="password" value={form.accessKeySecret} onChange={(value) => updateForm("accessKeySecret", value)} />
            <TextField label="STS SecurityToken" type="password" value={form.securityToken} onChange={(value) => updateForm("securityToken", value)} />
            <ActionButton icon={<ShieldCheck size={16} aria-hidden="true" />} onClick={validateLoginBucket} disabled={busy}>
              Validate
            </ActionButton>
          </div>
        </div>
        <StatusLine status={status} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-950">Research Preview</h1>
              <p className="text-xs text-zinc-500">{form.loginBucket} authorized</p>
            </div>
            <ShieldCheck className="text-emerald-700" size={22} aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton icon={<RefreshCw size={16} aria-hidden="true" />} onClick={reloadManifest} disabled={busy}>
              Reload
            </ActionButton>
            <ActionButton
              icon={<KeyRound size={16} aria-hidden="true" />}
              onClick={() => clearPreview("Logged out. Validate the login bucket to continue.")}
              disabled={busy}
              variant="secondary"
            >
              Log out
            </ActionButton>
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Database size={18} className="text-emerald-700" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-zinc-950">Data Source Bucket</h2>
          </div>
          <div className="grid gap-3">
            <TextField label="Bucket" value={form.dataBucket} onChange={(value) => updateForm("dataBucket", value)} />
            <TextField label="Endpoint" value={form.dataEndpoint} onChange={(value) => updateForm("dataEndpoint", value)} />
            <TextField label="Manifest key" value={form.manifestKey} onChange={(value) => updateForm("manifestKey", value)} />
          </div>
        </div>

        <StatusLine status={status} />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-950">Documents</h2>
          <div className="grid gap-2">
            {manifest?.items.length ? (
              manifest.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void loadDocument(item)}
                  className={[
                    "rounded-md border p-3 text-left transition",
                    selectedItem?.id === item.id
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-950">{item.title}</span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">
                      {item.language}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {item.type} / {item.version}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No manifest loaded.</p>
            )}
          </div>
        </div>

        <article className="min-w-0 rounded-md border border-zinc-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">{selectedItem?.title ?? "Preview"}</h2>
              <p className="text-xs text-zinc-500">{manifest?.title ?? "Research data source"}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600">
              <Eye size={14} aria-hidden="true" />
              {selectedItem?.version ?? "data source"}
            </span>
          </div>
          <div className="grid max-h-[calc(100vh-150px)] gap-4 overflow-auto px-4 py-4">
            {markdown ? renderMarkdown(markdown) : <p className="text-sm text-zinc-500">No document loaded.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
