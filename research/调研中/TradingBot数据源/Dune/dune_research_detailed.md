# Dune 数据源与 Agent 接入调研文档（优化版）

- 调研日期：2026-05-12
- 主题风格：黑白、线条、可拆分 HTML
- 范围：基于已有 Dune 调研 HTML 优化，补充官方文档中关于 Data Catalog、Data API、DuneSQL、MCP、Sim API、Billing、Materialized Views、Agent Skills 的最新信息。

## 快速结论

推荐将 Dune 接入为“链上结构化分析源 + AI Agent 可消费的数据仓库”。Dune 的核心价值不是低延迟交易行情，而是把链上 raw / decoded / curated 数据通过 SQL、API、Dashboard、Datashare、MCP 与 Sim API 交付给研究、工程和 Agent 工作流。

## 1. 执行摘要与最终判断

Dune 是面向 Web3 / onchain analytics 的数据平台，不是传统金融行情商。核心能力是把链上原始数据、合约解码数据、curated datasets、SQL 查询、Dashboard、API、Datashare、MCP 与实时 Sim API 组合成一套链上数据工作台。

**最终建议：推荐接入，但定位应是“链上结构化分析源 + AI Agent 可消费的数据仓库”。** 生产接入时不要让 Agent 高频自由生成 SQL；应优先沉淀 saved queries / materialized views / 缓存层，并与 Binance/OKX/CoinGecko/新闻/RSS/股票 API 等源组合。

### 评分

| 维度 | 评分 | 说明 |
|---|---:|---|
| 链上分析与 AI 数据源 | 4.6 / 5 | Dune 的数据覆盖、SQL、Dashboard、API、MCP 都适合分析型 Agent。 |
| 钱包/应用实时链上 API，基于 Sim | 4.2 / 5 | Sim 支持实时钱包、余额、交易、NFT、DeFi positions，但覆盖口径需按链和 endpoint 实测。 |
| 交易策略辅助信号 | 3.5 / 5 | 适合作为链上信号源，不适合作为交易撮合/订单簿主行情源。 |
| 传统金融/新闻主数据源 | 1.5 / 5 | 不覆盖股票、宏观、新闻舆情主数据。 |

### 相对原有内容的核心优化

| 原有表达 | 优化后表达 | 原因 |
|---|---|---|
| Dune 不适合低延迟行情源 | Dune Data Hub / Data API 不适合作为 CEX tick/orderbook 主源；但 Dune Sim 是面向 wallet/app 的实时链上 API，应作为独立产品评估。 | 避免把 Dune 的查询分析产品与 Sim 实时 API 混为一谈。 |
| 覆盖 100+ blockchains | 保留，但拆分为 Data Catalog 100+ chains、Sim 60+ chains、价格数据 70+ chains 等不同口径。 | 不同产品线覆盖口径不同。 |
| API/MCP 支持 | 拆成 REST Data API、SQL Execute、saved query、execution status/result、result filtering、webhooks、materialized views、MCP、Skills。 | 更适合工程接入和拆分开发任务。 |
| 成本不可控 | 拆成计算 credits、失败执行计费、导出计费、写入/存储 quota、Sim CU、Agent 重复查询风险。 | 方便做预算、缓存和限流策略。 |

## 2. 产品结构、数据覆盖与数据来源

### 2.1 产品结构

| 产品/能力 | 定位 | 适合做什么 | 不适合做什么 |
|---|---|---|---|
| Data Hub | SQL 查询 + 可视化 + Dashboard | 交互式链上分析、团队研究、公开 Dashboard | 毫秒级交易行情、外部新闻/股票数据 |
| Data API | 程序化执行 query、获取结果、管理数据 | 自动化报告、后端拉取指标、定时任务、Agent 工具调用 | 未缓存的高频自由 SQL |
| Datashare | 把 Dune 数据流入 Snowflake / BigQuery / Databricks 等 | 企业级数据仓库集成、稳定数据管道 | 小团队快速试错阶段的第一优先 |
| DuneSQL | 基于 Trino 的链上 SQL 引擎 | 跨链查询、varbinary / uint256 / int256、materialized views | 没有 SQL 能力的完全无代码场景，除非配合 MCP/Agent |
| MCP | AI Agent 远程工具入口 | 表发现、SQL 生成、执行、结果读取、可视化、Dashboard 管理 | 无人监管的高成本生产执行 |
| Sim API | 面向应用的实时链上 API | 钱包、portfolio、balances、transactions、NFTs、DeFi positions、activity | CEX orderbook、股票/新闻、传统宏观数据 |
| Catalyst | 链/协议接入 Dune 的集成工具包 | 链、协议、生态方让数据进入 Dune | 普通用户直接查询数据的主入口 |
| Agent Skills | 面向 Claude/Cursor/Codex/OpenCode 等的技能包 | 让 Agent 学会 Dune CLI / Sim API 的上下文、参数与调用约束 | 替代生产后端权限控制 |

### 2.2 数据组织方式

Dune 的数据组织可以拆成三层：

1. **Raw**：Block、transaction、log、trace 等节点索引数据，适合自定义分析和深度链上取数。
2. **Decoded**：基于 ABI / IDL 解析的合约事件与函数调用，适合协议行为与事件分析。
3. **Curated**：Dune 维护的标准化跨链数据集，适合生产报表、跨链指标、快速 POC。

### 2.3 主要数据集与使用价值

| 数据域 | 代表数据 | 对项目价值 | 建议优先级 |
|---|---|---|---|
| DEX / Trading | dex.trades、交易量、项目、token pair、amount_usd | 市场活跃度、协议份额、交易路径、异常交易 | 高 |
| Token / Prices | token transfers、minute/hour/day prices、metadata | 资金流、资产估值、钱包持仓、token universe | 高 |
| NFT | NFT trades、mints、metadata | NFT 市场、收藏品热度、钱包行为 | 中 |
| Stablecoin | stablecoin transfers、balances、activity classification | 流动性、链间迁移、资金避险/入场信号 | 高 |
| Bridge / CEX Flows | 跨链转账、CEX 流入流出、entity labels | 资金迁移、链上风险监控、交易所资金变化 | 高 |
| Lending / DeFi | supply、borrow、flash loans、liquidations | 协议风险、清算压力、资金成本 | 高 |
| Prediction Markets | Polymarket / Kalshi activity、positions、pricing | 事件交易、预测市场研究、叙事追踪 | 中高 |
| Labels / Identity | 地址标签、entity、协议/交易所标识 | 钱包归因、AML、资金流解释 | 高 |

### 2.4 数据来源与证据强度

| 来源类型 | 说明 | 证据强度 | 接入含义 |
|---|---|---|---|
| 链上节点 / indexer | raw blocks、transactions、logs、traces 来自链上索引。 | 强 | 适合高可信链上事实，但需要处理链重组、链延迟、字段差异。 |
| ABI / IDL / 合约解码 | decoded events/calls 基于 verified ABI / IDL 与 Dune 解码管线。 | 强 | 比 raw logs 更易用，但合约覆盖和 ABI 完整性会影响解析质量。 |
| Dune curated datasets | Dune 团队清洗、标准化、维护的跨链数据集。 | 强 | 生产查询优先使用，减少重复清洗和扫描成本。 |
| Partner / community data | Flashbots、Farcaster、Lens、Reservoir、Snapshot 等 partner/community 数据。 | 中高 | 适合扩展分析，但要保留来源标记。 |
| 外部市场数据 + 链上交易 | 价格系统结合外部市场数据与链上交易活动。 | 中高 | 适合估值和报表；交易执行仍应使用专业行情源。 |
| 非 Dune 数据源 | 新闻、Twitter/X、股票、宏观、CEX tick/orderbook。 | 不属于 Dune 主覆盖 | 需要组合其他 provider。 |

## 3. API、MCP 与 Agent 调用规范

### 3.1 API 能力矩阵

| 能力 | 典型端点/入口 | 用途 | 生产建议 |
|---|---|---|---|
| Execute saved query | `POST /v1/query/{query_id}/execute` | 执行已保存 query，可带参数 | 生产优先；SQL 可审计、可复用。 |
| Execute raw SQL | `POST /v1/sql/execute` | 直接提交任意 SQL | 适合 ad hoc / POC；生产要加白名单和 scan guard。 |
| Status | `GET /v1/execution/{execution_id}/status` | 轮询执行状态 | 不消耗查询结果拉取成本，先 status 再 results。 |
| Results JSON / CSV | `GET /v1/execution/{execution_id}/results` / `/results/csv` | 获取执行结果 | 配合 pagination / filtering / sorting。 |
| Latest query result | `GET /v1/query/{query_id}/results` | 拿最近一次结果 | 适合缓存型展示，配合 schedule 保鲜。 |
| Result filtering | `filters` / `columns` / `sort_by` | 服务端筛选结果 | 减少带宽和客户端处理。 |
| Materialized Views | `/v1/materialized-views/*` | 创建、刷新、删除、列出物化视图 | 高频复杂指标优先沉淀。 |
| Webhooks | Webhooks / Alerts | 执行完成、监控通知 | 适合异步工作流和告警。 |
| Account usage | Usage / API key endpoints | 用量监控 | 必须接入成本仪表盘。 |
| Sim API | Sim dashboard / docs.sim.dune.com | 钱包/余额/活动/交易/NFT/DeFi positions | 作为独立实时 onchain API 评估。 |

### 3.2 推荐调用流程

`Agent / Backend → Query Registry → Dune API → Local Cache → Product / Report`

Query Registry 应保存：`query_id`、业务名称、参数 schema、owner、成本预算、缓存 TTL、是否可由 Agent 调用。

### 3.3 cURL：raw SQL 执行

```bash
curl -X POST "https://api.dune.com/api/v1/sql/execute" \
  -H "Content-Type: application/json" \
  -H "X-Dune-Api-Key: $DUNE_API_KEY" \
  -d '{
    "sql": "SELECT blockchain, project, sum(amount_usd) AS volume_usd FROM dex.trades WHERE block_time > now() - interval '\''1'\'' day GROUP BY 1,2 ORDER BY volume_usd DESC LIMIT 20",
    "performance": "medium"
  }'
```

### 3.4 cURL：saved query 执行 + 结果读取

```bash
# 1. 执行 saved query
curl -X POST "https://api.dune.com/api/v1/query/$QUERY_ID/execute" \
  -H "X-Dune-Api-Key: $DUNE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query_parameters":{"chain":"ethereum"},"performance":"medium"}'

# 2. 查询状态
curl "https://api.dune.com/api/v1/execution/$EXECUTION_ID/status" \
  -H "X-Dune-Api-Key: $DUNE_API_KEY"

# 3. 获取结果
curl "https://api.dune.com/api/v1/execution/$EXECUTION_ID/results?limit=1000" \
  -H "X-Dune-Api-Key: $DUNE_API_KEY"
```

### 3.5 Codex MCP 配置

```bash
# OAuth 方式
codex mcp add dune --url "https://api.dune.com/mcp/v1"
codex mcp login dune

# API key 方式
codex mcp add dune_prod --url "https://api.dune.com/mcp/v1?api_key=<dune_api_key>"
```

### 3.6 Agent 使用原则

| 原则 | 说明 | 落地方式 |
|---|---|---|
| 先发现，再执行 | 先用 catalog/table search 确认 schema，再生成 SQL。 | MCP searchTables / listBlockchains，或人工维护 query registry。 |
| 生产优先 saved query | 减少自由 SQL 的成本和安全风险。 | 每个业务指标绑定 query_id、参数 schema、owner。 |
| 大查询物化 | Query View 没有性能收益；复杂指标用 Materialized View。 | 按天/小时 refresh，设置 cron 和 TTL。 |
| 缓存优先 | Agent 多轮对话会重复查询，容易浪费 credits。 | Redis / Postgres 缓存结果，按 query_id + params + time bucket 生成 cache key。 |
| 限制扫描范围 | 链上表巨大，必须限制时间、chain、protocol、字段。 | 默认加 `block_time` / `block_date` 条件，禁止 `SELECT *` 进入生产。 |
| 成本可观测 | Dune 按 compute / export / write 等维度消耗 credits。 | 保存 execution_id、SQL hash、credits、row_count、latency、cache_hit。 |

## 4. 接入架构与落地方案

### 4.1 推荐总体架构

```text
用户问题 / 定时任务 / 策略任务
  ↓
Agent Router / Backend Scheduler
  ├─ Dune MCP：探索数据表、临时分析、生成图表、人工辅助研究
  ├─ Dune Data API：执行已审计 saved query / materialized view / results endpoint
  ├─ Dune Sim API：实时钱包、余额、交易、NFT、DeFi positions
  ├─ Market APIs：Binance / OKX / CoinGecko / CMC，用于价格与交易所行情
  └─ News / Social APIs：RSS / X / News API，用于舆情和新闻
  ↓
Local Cache + Event Store
  ├─ query_result_cache(query_id, params_hash, ttl)
  ├─ wallet_events(source=dune_sim)
  ├─ onchain_metrics(source=dune_data_api)
  └─ cost_log(execution_id, latency, credits, rows)
  ↓
AI Pulse / Dashboard / Alert / Research Report / Trading Signal
```

### 4.2 数据模型建议

```json
{
  "source": "dune",
  "product": "data_api | mcp | sim | datashare",
  "domain": "dex | stablecoin | bridge | lending | wallet | nft | prediction | label | price",
  "operation": "execute_query | execute_sql | latest_result | sim_balances | sim_activity",
  "query": {
    "query_id": 123456,
    "sql_hash": "sha256:...",
    "params": {"chain": "ethereum", "window": "24h"}
  },
  "data": {},
  "meta": {
    "execution_id": "01HZ...",
    "fetched_at": "2026-05-12T00:00:00+08:00",
    "row_count": 1000,
    "cache_hit": false,
    "credit_estimate": null,
    "provider_url": "https://api.dune.com/api"
  },
  "error": null
}
```

### 4.3 按业务场景的接入方式

| 场景 | 推荐 Dune 能力 | 组合数据源 | 落地建议 |
|---|---|---|---|
| 链上日报 / 周报 | saved query + latest result + materialized views | CoinGecko/CMC 价格、新闻/RSS | Query 固化，结果入库，LLM 只负责解释。 |
| 钱包/地址监控 | Sim API + Data API labels / transfers | 自有地址库、风控规则 | Sim 做实时事件，Dune SQL 做深度背景。 |
| DEX / 协议分析 | dex.trades、lending、bridge、stablecoin curated datasets | 协议 TVL 源、价格源 | 先用 curated 表；复杂指标用 materialized views。 |
| AI Agent 问答 | MCP + curated tables + query registry | 搜索/新闻/行情 | Agent 可探索，但生产执行要走白名单。 |
| Trading Bot 信号 | 链上大额转账、CEX flows、stablecoin、bridge、liquidations | Binance/OKX orderbook、实时行情、交易所 WebSocket | Dune 只做辅助信号，不能替代实时行情。 |
| 企业数据仓库 | Datashare / Trino connector / dbt connector | Snowflake/BigQuery/Databricks | 从 API POC 过渡到 warehouse pipeline。 |

### 4.4 POC 到生产的路线

1. **验证数据可得性**：找 5 个核心指标，确认 Dune 是否有对应 curated 表或可行 SQL。
2. **固化 query**：把 POC SQL 变成 saved query，定义参数、owner、用途、刷新频率。
3. **接 API**：后端执行 query，轮询 status，拉 results，写入缓存和成本日志。
4. **优化成本**：对大查询改用 materialized views / scheduled refresh / result filtering / pagination。
5. **接 Agent**：MCP 只用于探索、调研、生成临时分析；生产任务只调用 registry 中的 approved query。
6. **组合数据源**：为行情、新闻、股票、宏观、交易所 orderbook 接入专门 provider。

## 5. 风险、成本与控制策略

### 5.1 风险矩阵

| 风险 | 等级 | 表现 | 控制策略 |
|---|---|---|---|
| Agent 自由 SQL 成本失控 | 高 | 重复查询、跨大表扫描、无时间过滤。 | query registry、SQL lint、时间范围默认限制、cache、rate limit。 |
| 失败执行也消耗 credits | 中高 | 错误 SQL / 超时 / 资源不足仍造成成本。 | 先本地 lint；小范围 preview；复杂查询用 medium/large 策略；记录失败原因。 |
| 结果过大 | 中 | 导出成本、网络延迟、32GB 结果上限、分页复杂。 | 服务端 filtering、columns、limit、pagination，必要时汇总而非拉明细。 |
| 数据新鲜度误解 | 中 | 用户把 latest result 当实时数据。 | 在结果里显示 execution_time / expires_at / query schedule。 |
| Sim 与 Data API 混用 | 中 | 实时钱包 endpoint 与分析 SQL 的 SLA/成本/覆盖不同。 | 产品线分层：Sim 负责实时 app，Data API 负责分析和报表。 |
| 权限与 API key 泄露 | 高 | MCP URL query api_key、日志泄露、团队 key 滥用。 | 优先 header/OAuth；env/vault 存储；日志脱敏；team key 分环境。 |
| 传统金融覆盖缺失 | 高 | 用户要求股票/宏观/新闻，Dune 无法主覆盖。 | 从架构层组合其他 provider。 |
| SQL 维护成本 | 中 | schema 变化、query owner 不明确、dashboard 无人维护。 | Query Registry + owner + test query + changelog。 |

### 5.2 成本控制清单

1. 所有生产 query 必须有 `block_date` 或 `block_time` 过滤。
2. 默认禁止 `SELECT *`，必须指定 columns。
3. 对外服务结果必须经过缓存，缓存 key = `query_id + params_hash + time_bucket`。
4. 复杂跨链指标优先写入 materialized view，并设置 refresh schedule。
5. 结果端点优先使用 server-side filtering / pagination。
6. 记录 `execution_id`、SQL hash、params、latency、row_count、cache_hit、credits。
7. 设置每日/每小时用量阈值，超过阈值时降级为 latest cached result。
8. Agent 只能调用 approved query；临时 SQL 需要人工确认或低额度 sandbox key。

### 5.3 建议的 Query Registry 表

```sql
CREATE TABLE query_registry (
  id TEXT PRIMARY KEY,
  provider TEXT DEFAULT 'dune',
  product TEXT,                    -- data_api | mcp | sim
  business_name TEXT,
  query_id BIGINT,
  sql_hash TEXT,
  owner TEXT,
  params_schema JSONB,
  approved_for_agent BOOLEAN DEFAULT FALSE,
  cache_ttl_seconds INT,
  max_expected_rows INT,
  max_time_window_days INT,
  refresh_type TEXT,                -- manual | schedule | materialized_view
  risk_level TEXT,                  -- low | medium | high
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 5.4 数据新鲜度标注模板

```json
{
  "metric": "ethereum_dex_volume_24h",
  "value": 123456789.12,
  "source": "dune",
  "query_id": 123456,
  "execution_id": "01HZ...",
  "executed_at": "2026-05-12T08:00:00Z",
  "result_expires_at": "2026-08-10T08:00:00Z",
  "data_window": {
    "from": "2026-05-11T08:00:00Z",
    "to": "2026-05-12T08:00:00Z"
  },
  "freshness_label": "fresh_query | latest_cached | materialized_view | stale"
}
```

## 6. POC 任务拆分与验收标准

### 6.1 最小 POC 指标清单

| # | 指标 | 推荐数据源 | 验收标准 |
|---:|---|---|---|
| 1 | 24h DEX volume by chain/project | `dex.trades` | 可返回 Top 20，含 chain、project、volume_usd。 |
| 2 | Stablecoin net flow by chain | stablecoin curated datasets | 可按日聚合 inflow/outflow/netflow。 |
| 3 | CEX inflow/outflow | CEX flows + labels | 可识别交易所 entity 和 token 流向。 |
| 4 | Bridge volume | bridges curated datasets | 可按 source/destination chain 聚合。 |
| 5 | Wallet balances / activity | Sim API + balances / activity | 单地址可查余额、交易、活动，延迟满足应用需求。 |
| 6 | Lending liquidations | lending curated datasets | 可返回协议、链、金额、时间、清算事件。 |
| 7 | Prediction market activity | Polymarket / Kalshi datasets | 可输出 market、volume、positions 或 price 变化。 |

### 6.2 两周 POC 排期

| 周期 | 任务 | 产出 |
|---|---|---|
| Day 1-2 | 注册 Dune、获取 API Key、确认 plan/credits、跑通 SQL Execute 和 saved query。 | API connectivity report。 |
| Day 3-4 | 选择 5 个核心指标，确定 Dune tables，写 POC SQL。 | SQL notebook / Dune queries。 |
| Day 5 | 接入 execution status/result、pagination/filtering。 | 后端拉取脚本。 |
| Day 6-7 | 缓存、成本日志、错误处理。 | query cache + cost log。 |
| Day 8-9 | 复杂指标改 materialized views 或 scheduled saved query。 | 物化/定时刷新策略。 |
| Day 10 | 接 MCP 到 Codex/Claude/Cursor，用于研究探索。 | Agent 调研工作流。 |
| Day 11-12 | 测试 Sim API 的 wallet / balances / activity / DeFi positions。 | Sim endpoint 测试表。 |
| Day 13-14 | 形成生产接入建议：保留/放弃/组合数据源。 | POC conclusion + backlog。 |

### 6.3 验收标准

- 每个指标都能追溯到 table、query_id、execution_id、data_window。
- 所有生产候选 query 都有时间过滤、参数 schema、缓存 TTL、owner。
- API 拉取结果具备 pagination、retry、timeout、error logging。
- 可区分 Dune Data API 与 Sim API 的数据新鲜度和适用场景。
- 能输出至少 3 个可进入产品的事件卡片：DEX volume spike、stablecoin netflow、wallet activity。

### 6.4 后续 Backlog

| 优先级 | 任务 | 说明 |
|---|---|---|
| P0 | Query Registry | 没有 registry 不建议让 Agent 进生产。 |
| P0 | Cost Dashboard | 按 execution_id 汇总成本、失败率、cache hit。 |
| P1 | Dune MCP Research Workspace | 给研究员和 Agent 探索，不直接连生产 key。 |
| P1 | Materialized View Pipeline | 复杂指标先物化，再由后端读结果。 |
| P1 | Sim API Wallet Module | 如果产品需要地址实时画像，单独 POC。 |
| P2 | Datashare / Trino / dbt | 数据规模扩大后再评估。 |

## 7. HTML 拆分方案与编辑说明

### 7.1 文件拆分

| 文件 | 用途 | 适合谁编辑 |
|---|---|---|
| `index.html` | 总览入口，导航到所有章节。 | 产品/研究负责人。 |
| `01-summary.html` | 执行摘要、评分、最终建议。 | 决策层、投研负责人。 |
| `02-product-data.html` | 产品结构、数据覆盖、数据来源。 | 研究员、数据分析师。 |
| `03-api-mcp.html` | API、MCP、Agent 调用规范和代码。 | 后端工程、Agent 工程。 |
| `04-integration.html` | 接入架构、数据模型、业务场景。 | 架构师、产品工程。 |
| `05-risk-cost.html` | 风险、成本、权限、缓存和可观测性。 | 平台/安全/财务。 |
| `06-poc.html` | POC 清单、排期、验收标准。 | 项目经理、工程团队。 |
| `07-html-split.html` | 本文件，说明如何继续拆分和改版。 | 前端/设计。 |
| `assets/style.css` | 全局黑白线框风格。 | 前端/设计。 |

### 7.2 黑白线条视觉规范

- **色彩**：只使用黑、白、灰；不使用渐变和强调色。
- **结构**：以细线边框、表格线、分割线、流程箭头为主要视觉语言。
- **信息层级**：大标题 + 线条分割 + 表格/卡片，不依赖颜色表达优先级。
- **可打印**：CSS 已包含 print 样式，适合转 PDF 或直接打印。
- **可拆分**：每个章节可独立打开；所有页面共享 `assets/style.css`。

### 7.3 后续可细化方向

1. 把 `03-api-mcp.html` 拆成 API Reference、MCP Setup、Agent Policy 三页。
2. 把 `06-poc.html` 拆成 Sprint Backlog、SQL Library、Acceptance Tests 三页。
3. 给每个指标补真实 query_id、Dune URL、执行截图、返回样例。
4. 建立 `queries/` 目录，单独保存 SQL 文件，HTML 中只引用摘要。
5. 建立 `data/` 目录，保存 POC 输出 CSV/JSON，便于复盘。

## 8. 信息来源

- **Dune Data Catalog**: https://docs.dune.com/data-catalog/overview — 官方说明 raw / decoded / curated 三层数据、100+ blockchains、主要 curated datasets 与覆盖范围。
- **Dune API Overview**: https://docs.dune.com/api-reference/overview/introduction — 官方 API 概览：saved query 执行、结果获取、Data API、Trino/BI、Sim、dbt 等入口。
- **Dune Execute SQL API**: https://docs.dune.com/api-reference/executions/endpoint/execute-sql — 任意 SQL 执行端点、Header、performance tier、usage-based credits。
- **Dune Execution Object / Results**: https://docs.dune.com/api-reference/executions/execution-object — 执行 query、获取 latest result、execution_id、status/result 工作流。
- **Dune Execution Result**: https://docs.dune.com/api-reference/executions/endpoint/get-execution-result — execution result JSON、90 天结果保存、32GB 查询结果上限、分页/过滤。
- **Dune Result Filtering**: https://docs.dune.com/api-reference/executions/filtering — 结果端点支持服务端 filtering、pagination、sorting，减少带宽与成本。
- **Dune MCP Docs**: https://docs.dune.com/api-reference/agents/mcp — 官方 Remote MCP：OAuth / API Key 鉴权、Codex / Claude / Cursor 等客户端配置。
- **Dune MCP Blog**: https://dune.com/blog/dune-mcp — MCP 上线说明：100+ chains、12 tools、Agent 从自然语言到 SQL / result / visualization。
- **Dune Billing**: https://docs.dune.com/api-reference/overview/billing — API billing：failed executions charged、compute credits、export/write/storage/webhooks。
- **Dune Query Engine**: https://docs.dune.com/query-engine/overview — DuneSQL：Trino fork、varbinary、uint256/int256、columnar、query views、materialized views。
- **Dune Materialized Views**: https://docs.dune.com/api-reference/materialized-views/overview — Materialized Views API、命名规范、refresh、performance tiers、cron schedule。
- **Dune Sim API**: https://sim.dune.com/api — Sim：60+ chains、real-time synchronous access、balances、DeFi positions、NFTs、transactions、activity 等。
- **Dune Prices Overview**: https://docs.dune.com/data-catalog/curated/prices/overview — 价格系统：跨 70+ chains 的 token prices，结合外部市场数据与链上交易活动。
- **Dune Agent Skills GitHub**: https://github.com/duneanalytics/skills — Agent skills：dune skill 用于查询/表发现/usage；sim skill 用于实时 wallet/token lookup。

## 9. 使用说明

- `dune_research_bw_full.html`：完整单页版本，适合预览、打印、转 PDF。
- `split/index.html`：可拆分入口。
- `split/01-summary.html` 到 `split/07-html-split.html`：章节页，可分别细化。
- `split/assets/style.css`：统一黑白线条样式。

## 10. 需要实测的项目

1. Dune 当前账户 plan 下的实际 credits、rate limit、storage quota。
2. 目标链与目标协议在 Data Catalog 中的具体 table 覆盖。
3. Sim API 对目标地址、目标链、目标 DeFi 协议的延迟和返回完整性。
4. MCP 在 Codex / Claude / Cursor 中的实际 timeout、认证、工具列表和错误表现。
5. Materialized View 的刷新成本、cron 限制和对目标 query 的性能收益。
