const data = {
  summaryCards: [
    {
      label: "定位",
      title: "Kaito Pro 是垂直 Web3 情报平台",
      body: "官方说明显示，Kaito Pro 用于索引社媒、治理论坛、研究、新闻、播客、会议转录等来源，并结合语义模型与实时分析，解决加密信息碎片化问题。"
    },
    {
      label: "API",
      title: "商业 API 以 Contact Sales 为主",
      body: "官网 API 页面只公开说明能力范围：系统化访问 Kaito 自有数据、实时知识数据集、量化社交指标、2000 tokens 覆盖；没有公开完整 endpoint、鉴权和 SLA 文档。"
    },
    {
      label: "公开接口",
      title: "Yaps API 有公开端点",
      body: "文档公开了 /api/v1/yaps，支持 user_id 或 username 查询 X 账号的 Yaps 分数，默认限额 100 calls / 5 minutes。"
    },
    {
      label: "定价",
      title: "Pro 单席 $833/月，API 另询价",
      body: "价格页显示 Enterprise Single-Seat 为 $833/month billed annually；API 显示 Contact Sales。年度/双年度可享折扣，年度或双年度支持加密货币付款。"
    }
  ],
  apis: [
    {
      filter: ["official"],
      tag: "官方 / 商业 API",
      title: "Kaito API",
      description: "面向基金、项目团队、研究机构、交易所等客户，提供系统化访问 Kaito 自有数据集的能力，用于决策、监控和分析。",
      meta: ["Contact Sales", "企业级", "实时 + 历史数据", "2000 tokens 覆盖"],
      bullets: [
        "官方明确：可访问 proprietary in-house datasets。",
        "可访问实时知识数据集与可量化社交指标。",
        "公开页面未披露完整 endpoint、鉴权方式、正式 SDK、SLA、配额或报价。",
        "适合将 sentiment、mindshare、catalyst、narrative 等信号接入内部研究或风控系统。"
      ]
    },
    {
      filter: ["official", "public"],
      tag: "官方 / 公开端点",
      title: "Yaps API：/api/v1/yaps",
      description: "用于查询指定 X 账号的 Yaps 分数。文档要求 user_id 或 username 至少提供一个，其中 user_id 被标记为 recommended。",
      meta: ["GET", "无需公开说明 API Key", "100 calls / 5 min", "按 X 用户查询"],
      bullets: [
        "Endpoint: https://api.kaito.ai/api/v1/yaps",
        "参数：user_id，可选但推荐；username，可选。两者至少传一个。",
        "返回：user_id、username、yaps_all、yaps_l24h、yaps_l48h、yaps_l7d、yaps_l30d、yaps_l3m、yaps_l6m、yaps_l12m。",
        "注意：2026 年第三方资料称 Yaps 激励/leaderboard 已调整或关停，但 Pro 与 API 仍继续；上线前需要实际验证端点可用性。"
      ]
    },
    {
      filter: ["payg"],
      tag: "PAYG / x402 补充信息",
      title: "x402 按次付费端点",
      description: "第三方 x402 skill 文档列出若干 Kaito 付费端点；这类信息不是 Kaito 官网价格页主体披露内容，应作为待验证的补充。",
      meta: ["USDC on Base", "HTTP 402", "按点/按请求", "需验证"],
      bullets: [
        "/api/payg/mindshare：$0.02 / data point。",
        "/api/payg/sentiment：$0.02 / data point。",
        "/api/payg/narrative_mindshare：$0.02 / data point。",
        "/api/payg/smart_followers：$0.20 / request。",
        "实现方式通常是首次请求遇到 402 Payment Required，再用 x402 客户端签名支付并重试请求。"
      ]
    },
    {
      filter: ["official"],
      tag: "MCP / Agent 使用",
      title: "MCP Access",
      description: "Kaito 价格页显示所有计划包含 MCP access，并标注可与 Cursor、Claude 等工具配合。",
      meta: ["随计划包含", "Cursor", "Claude", "Agent Workflow"],
      bullets: [
        "适合把 Kaito 数据作为 AI 编程工具、研究助手或内部 Agent 的上下文来源。",
        "官方价格页没有公开 MCP server URL、安装命令或鉴权细节。",
        "采购前应向 Kaito 确认 MCP 工具列表、可查询数据范围、速率限制和日志/隐私策略。"
      ]
    }
  ],
  codeExamples: [
    {
      name: "Yaps cURL",
      code: `curl -X GET "https://api.kaito.ai/api/v1/yaps?username=VitalikButerin"`
    },
    {
      name: "前端 fetch",
      code: `async function getYaps(username) {
  const url = new URL("https://api.kaito.ai/api/v1/yaps");
  url.searchParams.set("username", username.replace(/^@/, ""));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(\`Kaito Yaps API failed: \${res.status}\`);
  }

  const data = await res.json();
  return {
    userId: data.user_id,
    username: data.username,
    total: data.yaps_all,
    last24h: data.yaps_l24h,
    last7d: data.yaps_l7d,
    last30d: data.yaps_l30d
  };
}`
    },
    {
      name: "x402 PAYG 示例",
      code: `# 第三方 x402 skill 文档给出的模式，需先验证官方 KaitoX402APIDocs 与实际 402 响应
export EVM_PRIVATE_KEY="0xYOUR_DEDICATED_HOT_WALLET_KEY"
export X402_MAX_PAYMENT_USD="5.00"

python x402_cli.py fetch \
  "https://api.kaito.ai/api/payg/mindshare?token=BTC&start_date=2026-02-13&end_date=2026-02-14" \
  --json \
  --dry-run`
    },
    {
      name: "企业 API 采购清单",
      code: `向 Kaito Sales 确认：
1. 需要的数据集：token mindshare、narrative mindshare、sentiment、mentions、engagement、catalyst、rankings。
2. Endpoint 与 SDK：REST / WebSocket / MCP / 批量导出；是否提供 OpenAPI spec。
3. 认证与权限：API key、OAuth、IP allowlist、组织/席位隔离。
4. 价格：基础费、调用费、历史数据费、超额费、SLA、付款周期。
5. 合规：数据可再分发范围、商用限制、日志保存、数据更新频率与延迟。`
    }
  ],
  pricing: [
    {
      item: "Kaito Pro Enterprise Single-Seat",
      price: "$833 / month，billed annually",
      includes: "Kaito Pro 企业单席；价格页同时展示年度/双年度折扣，以及 Kaito Katalyzer community、MCP access 等权益。",
      note: "适合个人研究员、投资/增长团队的单席使用；若按月或双年度选择，实际账单需以官网 checkout 为准。"
    },
    {
      item: "Kaito API",
      price: "Contact Sales",
      includes: "系统化访问 Kaito proprietary datasets、实时知识数据集、量化社交指标、覆盖 2000 tokens 的实时与历史数据。",
      note: "没有公开固定单价；需要按数据范围、调用量、历史区间、席位、SLA 询价。"
    },
    {
      item: "Yaps Public API",
      price: "未公开收费；默认限额 100 calls / 5 min",
      includes: "查询 X 账号 Yaps 相关分数与多时间窗口分数。",
      note: "公开端点不等于无限制商用；正式产品接入前应确认 API Terms、可用性和商业使用限制。"
    },
    {
      item: "x402 PAYG 端点",
      price: "$0.02 / data point 或 $0.20 / request（第三方文档披露，需验证）",
      includes: "mindshare、sentiment、narrative_mindshare、smart_followers 等按次/按点付费数据。",
      note: "此类信息来自 x402 skill/目录文档，不是 Kaito 官方价格页主体披露；生产接入前需验证官方 GitHub 文档与实际支付响应。"
    },
    {
      item: "付款与退款规则",
      price: "信用卡；年度/双年度可用 crypto；无退款",
      includes: "价格页 FAQ 显示信用卡计费；年度或双年度支持 crypto payment；订阅取消在下个账期生效。",
      note: "已付账期不退款，取消后可继续使用到当前账期结束。"
    }
  ],
  usage: [
    {
      title: "Kaito Pro 手动使用",
      body: "进入 pro.kaito.ai，注册或联系销售；用 MetaSearch 搜索 ticker、topic、narrative；再用 Dashboard/Feeds 建立 watchlist，用 Smart Alerts 监控项目、关键词、事件、情绪变化和催化剂。"
    },
    {
      title: "公开 Yaps API 接入",
      body: "后端服务通过 GET /api/v1/yaps 查询 username 或 user_id；实现缓存、重试和限流保护；将 yaps_all、yaps_l7d、yaps_l30d 等字段映射到你的创作者评分或社交影响力模块。"
    },
    {
      title: "商业 Kaito API 接入",
      body: "先定义要买的数据：mindshare、sentiment、narrative、catalyst、rankings、search feed 或 historical data；向销售索要 API 文档、测试 key、配额、价格、SLA 与数据使用条款；再落地 ETL 或实时监控管道。"
    },
    {
      title: "MCP / Agent 接入",
      body: "如果需要在 Cursor、Claude 或内部 Agent 中使用 Kaito，需要确认 MCP server 的配置、工具列表、可访问数据范围和权限控制。价格页说明 MCP access included with all plans，但公开配置细节不足。"
    },
    {
      title: "x402 PAYG 实验接入",
      body: "仅用于验证或小规模实验。使用专用热钱包、设置 max payment cap、先 dry-run，再发起支付请求。不要把主钱包私钥写入脚本或提交到仓库。"
    }
  ],
  goodFit: [
    "需要高质量 Web3 信息检索，而不是通用搜索引擎。",
    "需要 token / narrative mindshare、sentiment、catalyst 等情报信号。",
    "面向投资研究、项目增长、KOL/社区分析、竞品监控、交易所/做市信息流监控。",
    "团队预算可接受企业级订阅或按需询价。"
  ],
  checks: [
    "确认商业 API 的正式 endpoint、鉴权方式、速率限制、SLA、数据延迟与历史回溯范围。",
    "确认 x402 PAYG 端点是否由 Kaito 官方维护，以及付款失败、退款、发票和税务处理方式。",
    "确认 Yaps 在 2026 年产品调整后的数据可用性和使用限制。",
    "如果用于交易或投研决策，必须结合链上数据、价格数据、新闻源和人工复核，不应单独依赖 mindshare 或 sentiment。"
  ],
  sources: [
    {
      type: "官方",
      title: "Kaito API 页面",
      note: "商业 API 能力、客户类型、proprietary datasets、2000 tokens 覆盖。",
      url: "https://pro.kaito.ai/kaito-api"
    },
    {
      type: "官方",
      title: "Kaito Pricing 页面",
      note: "Enterprise Single-Seat 价格、API Contact Sales、MCP access、付款/退款 FAQ。",
      url: "https://pro.kaito.ai/pricing"
    },
    {
      type: "官方文档",
      title: "Kaito Pro — AI Platform",
      note: "Kaito Pro 的核心功能：MetaSearch、Sentiment Analytics、Smart Alerts、Dashboards、Mindshare、Catalyst Calendar、Audio Library、AI Copilot。",
      url: "https://docs.kaito.ai/kaito-pro-ai-platform"
    },
    {
      type: "官方文档",
      title: "Yaps Open Protocol",
      note: "Yaps API 端点、参数、返回字段、默认限流。",
      url: "https://docs.kaito.ai/kaito-yaps-tokenized-attention/yaps-open-protocol"
    },
    {
      type: "官方",
      title: "Kaito Portal 产品页",
      note: "MetaSearch、Sentiment Tracking、Smart Alerts、Dashboard、Token/Narrative Mindshare、Catalyst Calendar 等模块展示。",
      url: "https://pro.kaito.ai/portal"
    },
    {
      type: "第三方",
      title: "CoinGecko 2026 Kaito Guide",
      note: "2026 年产品状态补充：Kaito Pro、API、Capital Launchpad 继续；Yaps 激励项目发生调整。",
      url: "https://www.coingecko.com/learn/what-is-kaito-earn-yap-points"
    },
    {
      type: "第三方",
      title: "Web3Connect - Kaito Market Intelligence Platform",
      note: "补充说明 Kaito API 可能覆盖的 programmatic access 类型、MCP 适用工具与企业目标客户。",
      url: "https://web3connect.com/product/kaito-market-intelligence-platform-kaito"
    },
    {
      type: "第三方 / 待验证",
      title: "x402 Payments / ClawHub",
      note: "列出 Kaito PAYG 端点与价格；生产使用前需验证 GitHub KaitoX402APIDocs 与实际 API 响应。",
      url: "https://clawhub.ai/adlai88/simmer-x402"
    }
  ]
};

const summaryCards = document.getElementById("summaryCards");
const apiCards = document.getElementById("apiCards");
const pricingRows = document.getElementById("pricingRows");
const usageSteps = document.getElementById("usageSteps");
const goodFit = document.getElementById("goodFit");
const checks = document.getElementById("checks");
const sourceList = document.getElementById("sourceList");
const codeTabs = document.getElementById("codeTabs");
const codeBlock = document.getElementById("codeBlock");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const toast = document.getElementById("toast");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSummaryCards() {
  summaryCards.innerHTML = data.summaryCards.map(card => `
    <article class="card">
      <span class="label">${escapeHtml(card.label)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.body)}</p>
    </article>
  `).join("");
}

function renderApiCards(filter = "all") {
  const cards = data.apis.filter(api => filter === "all" || api.filter.includes(filter));
  apiCards.innerHTML = cards.map(api => `
    <article class="api-card">
      <span class="tag">${escapeHtml(api.tag)}</span>
      <h3>${escapeHtml(api.title)}</h3>
      <p>${escapeHtml(api.description)}</p>
      <div class="meta">${api.meta.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <ul>${api.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderPricing() {
  pricingRows.innerHTML = data.pricing.map(row => `
    <tr>
      <td><strong>${escapeHtml(row.item)}</strong></td>
      <td>${escapeHtml(row.price)}</td>
      <td>${escapeHtml(row.includes)}</td>
      <td>${escapeHtml(row.note)}</td>
    </tr>
  `).join("");
}

function renderUsage() {
  usageSteps.innerHTML = data.usage.map((step, index) => `
    <article class="step">
      <div class="step-number">${index + 1}</div>
      <div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.body)}</p>
      </div>
    </article>
  `).join("");
}

function renderList(target, list) {
  target.innerHTML = list.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderSources() {
  sourceList.innerHTML = data.sources.map(source => `
    <article class="source-card">
      <span class="source-type">${escapeHtml(source.type)}</span>
      <div>
        <h3>${escapeHtml(source.title)}</h3>
        <p>${escapeHtml(source.note)}</p>
      </div>
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">打开来源</a>
    </article>
  `).join("");
}

function setCodeExample(index) {
  const example = data.codeExamples[index];
  codeBlock.textContent = example.code;
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

function renderCodeTabs() {
  codeTabs.innerHTML = data.codeExamples.map((example, index) => `
    <button class="tab-btn ${index === 0 ? "active" : ""}" data-code-index="${index}">${escapeHtml(example.name)}</button>
  `).join("");
  setCodeExample(0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function bindEvents() {
  document.querySelectorAll(".filter-pill").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderApiCards(button.dataset.filter);
    });
  });

  codeTabs.addEventListener("click", event => {
    const button = event.target.closest(".tab-btn");
    if (!button) return;
    setCodeExample(Number(button.dataset.codeIndex));
  });

  copyCodeBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeBlock.textContent);
      showToast("已复制代码");
    } catch (error) {
      showToast("复制失败，请手动复制");
    }
  });

  const navLinks = Array.from(document.querySelectorAll(".side-nav a"));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  window.addEventListener("scroll", () => {
    let currentId = sections[0]?.id;
    for (const section of sections) {
      const box = section.getBoundingClientRect();
      if (box.top <= 140) currentId = section.id;
    }
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`));
  }, { passive: true });
}

function init() {
  renderSummaryCards();
  renderApiCards();
  renderPricing();
  renderUsage();
  renderList(goodFit, data.goodFit);
  renderList(checks, data.checks);
  renderSources();
  renderCodeTabs();
  bindEvents();
}

init();
