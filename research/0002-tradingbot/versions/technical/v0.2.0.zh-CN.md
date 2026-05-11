# TradingBot 数据源技术调研

当前版本: v0.2.0
状态: active
最后更新: 2026-05-11

English version: `technical.md`

## 范围

本文从技术视角整理 TradingBot 候选数据源的接入方式、数据形态、系统分层、验证计划、授权边界和风险。产品定位和优先级判断维护在 `product.zh-CN.md`。

本版本按用户提供清单和 `0.2` 补充修正入库，清单标注 `last_verified_at` 为 2026-05-11。本轮重点核对 A 股/中国市场补充源的接口性质、授权风险和生产适配边界。

## 技术分层

| 层级 | 代表 provider | 技术职责 |
| --- | --- | --- |
| Agent / 聚合层 | OpenBB, Surf / AskSurf, Alpha Vantage MCP, EODHD MCP | 将多个数据源暴露给 Agent、工作流和内部工具 |
| 实时/历史行情层 | Massive / Polygon, FMP, Finnhub, Twelve Data, EODHD, Alpha Vantage | 股票、期权、外汇、指数、Crypto 的 REST/WebSocket/文件数据 |
| 官方底层源 | SEC EDGAR, FRED | 美股 filings、XBRL company facts、宏观时间序列 |
| Crypto 链上和基本面 | Dune, DefiLlama, Messari, CoinGecko | 链上 SQL、DeFi 指标、Token metadata、DEX、研究数据 |
| Crypto 情报增强 | Nansen, Arkham, Kaito, Santiment | 钱包标签、实体归因、社交叙事、情绪、开发活跃度 |
| 中国市场补充 | TuShare Pro / ths_hot, AKShare, SuperMind query_iwencai, JoinQuant / JQData | A 股、基金、期货、宏观、本地量化数据、同花顺热榜、自然语言选股 |
| 中国市场研究连接器 | mootdx, 腾讯财经页面/非官方接口, pywencai | 通达信协议/本地数据读取、腾讯行情页面交叉验证、问财社区连接器 |
| 机构级接入 | FactSet, LSEG, Bloomberg / BLPAPI | 企业合同、交易所 feeds、终端生态和合规数据 |

## 建议系统设计

- 建立 provider registry：记录 provider id、优先级、资产覆盖、数据权限、刷新频率、成本和 fallback 顺序。
- 建立 connector adapter：每个 provider 独立处理鉴权、分页、rate limit、错误重试、字段映射和数据延迟声明。
- 建立 normalized data model：统一 symbol、exchange、chain、token、wallet、entity、filing、macro series 和 news event。
- 建立 entitlement guard：把展示权、二次分发、derived data、全文新闻、交易所费用和用户权限放进运行时策略。
- 建立 raw-to-curated 存储：保留原始响应以便审计，同时输出标准化数据表供策略和 Agent 使用。
- 建立 freshness monitor：对行情、新闻、链上、社交、宏观和 filings 使用不同 freshness SLA。
- 不把这些结构化数据源当作通用 Web search。若 TradingBot 需要全网搜索，应单独引入搜索 provider。

## 接入方式矩阵

| Provider | Access methods | 主要资产 | 技术备注 |
| --- | --- | --- | --- |
| OpenBB | Python SDK, REST API, MCP Server, Workspace, Excel | 股票、ETF、期权、宏观、外汇、Crypto、自定义数据 | 适合作为聚合层和 Agent 工具层，核心风险在 provider 授权和 MCP 生产稳定性 |
| Surf / AskSurf | REST API, OpenAPI, CLI, MCP, Agent skill | Crypto、Token、钱包、链上、预测市场 | Crypto 竞品基线和 Agent 数据 API，需要核对 200+ sources 明细 |
| Massive.com / Polygon.io | REST API, WebSocket, Flat Files | 股票、期权、期货、指数、外汇、Crypto、经济、另类数据 | 适合行情核心源，必须验证交易所费用、延迟和二次分发 |
| Financial Modeling Prep | REST API, WebSocket, Bulk / endpoint APIs | 股票、指数、外汇、Crypto、ETF、基本面、新闻 | 股票基本面和新闻补充候选，需要核对 SEC 数据一致性 |
| Finnhub | REST API, WebSocket | 股票、外汇、Crypto、经济数据、另类数据 | 综合金融 API 候选，需要验证全球市场覆盖和 WebSocket 稳定性 |
| Twelve Data | REST API, WebSocket, SDK, CSV, JSON, Spreadsheet add-ins | 股票、ETF、外汇、Crypto、指数、基本面 | 跨市场行情源，需要验证目标交易所覆盖和企业授权 |
| Alpha Vantage | REST API, CSV, JSON, Excel, MCP Server | 股票、ETF、基金、指数、期权、外汇、Crypto、商品、经济指标 | 开发者友好，适合原型和技术指标，需验证免费额度和 MCP 粒度 |
| EODHD | REST API, WebSocket, SDK, OpenAPI, MCP Server | 股票、ETF、基金、外汇、指数、债券、期权、Crypto | 成本可控候选，需要验证 US options 深度和 MCP 鉴权 |
| Intrinio | REST API, SDK, Data marketplace | 股票、期权、ETF、基本面、新闻 | 偏企业数据包，需要逐包评估价格和字段质量 |
| Nasdaq Data Link | Streaming API, REST API, Tables API, Python SDK, Excel Add-in | 股票、指数、经济、另类、金融数据 | 数据 marketplace，需要按 dataset 核对价格、授权和更新频率 |
| SEC EDGAR | REST API, JSON | 美股公司 submissions、filings、XBRL company facts | 免费底层源，需要 XBRL 清洗、taxonomy 映射和 User-Agent 合规 |
| FRED | REST API, Excel Add-in, Web interface | 宏观指标、利率、通胀、GDP、就业 | 宏观底座，需要确认 ALFRED vintage data 是否进入范围 |
| Benzinga | REST API, WebSocket API | 股票新闻、分析师评级、price targets、市场事件 | 事件驱动候选，需要核对新闻内容展示权和历史归档价格 |
| Dune | Web app, SQL, API, Datashare | 链上 raw、decoded、curated datasets | 链上 SQL 仓库，需要验证查询成本、刷新频率和导出限制 |
| DefiLlama | Free API, Pro API, Web dashboard | TVL、fees、revenue、volume、yields、stablecoins、bridges | DeFi 指标候选，需要评估 Free/Pro 差异和 adapter 质量 |
| Messari | REST API, Bulk API, Terminal | Crypto 价格、on-chain metrics、研究、新闻、token unlocks、fundraising | Crypto 基本面候选，需验证内容展示权和批量历史下载 |
| CoinGecko | REST API, WebSocket, Webhook | Crypto 价格、metadata、historical charts、exchange、DEX、on-chain pools | Crypto 市场数据候选，需验证刷新频率、rate limit 和 DEX 覆盖 |
| Nansen | API, Platform | 钱包、Token、链上、Smart Money、标签 | 钱包画像和聪明钱追踪，需要验证标签准确性和 credit 机制 |
| Arkham | API, Platform | 地址、实体、标签、资金流 | 实体归因候选，需要验证合规限制和目标链覆盖 |
| Kaito | Platform, API availability to be verified | Crypto 社交、叙事、项目、Token | 社交/mindshare 候选，API 开放度需要优先确认 |
| Santiment | API, GraphQL, Platform, MCP availability to be verified | 社交情绪、开发活跃度、链上指标、市场信号 | Crypto 因子候选，需要验证指标定义和 GraphQL 查询成本 |
| TuShare Pro / ths_hot | TuShare Pro API | 同花顺热股、概念板块、ETF、可转债、行业板块、期货、港股、热基、美股 | `ths_hot` 是同花顺热榜结构化入口；需要验证 TuShare 积分、单次限制、刷新频率和同花顺商业授权 |
| AKShare | Python package, AKTools HTTP API / Docker | 股票、A股、港股、美股、期货、期权、基金、外汇、债券、指数、Crypto | 开源采集/清洗连接器，不是授权数据供应商；适合研究、原型和多源交叉校验 |
| SuperMind query_iwencai | SuperMind / 同花顺量化研究环境函数 | A股、基金、指数、新三板、港股、美股 | 官方研究环境里的自然语言选股函数；适合实时选股验证，不应直接作为回测底座 |
| mootdx | Python package, CLI, TDX protocol-style quote client, local TDX reader | A股、指数、通达信扩展市场、通达信财务文件 | 通达信数据读取封装；项目声明非商业用途，适合个人研究和原型验证 |
| 腾讯财经 | Web pages, community-used unofficial HTTP endpoints, third-party wrappers | A股、港股、美股、指数、基金、外汇、期货、黄金 | 页面源和非官方接口源；本轮未确认公开官方股票 API 文档，不建议生产主用 |
| pywencai | Python package, cookie-based web access emulation | A股、指数、基金、港股、美股、新三板、可转债、保险、期货、理财、外汇 | 非同花顺官方工具；当前需要 cookie，需低频、限速和合规评估 |
| JoinQuant / JQData | JQData SDK, Platform API | 股票、期货、基金、期权、债券、宏观 | A股量化候选，需要验证分钟数据、复权逻辑和商用限制 |
| FactSet | APIs, FQL, Screening formulas, enterprise integrations | 股票、基本面、估值、持仓、固收、组合、行情 | 机构级方案，接入前需要合同和内容集授权 |
| LSEG Data & Analytics | Enterprise APIs, Feeds, Workspace, Data platform | 股票、固收、FX、商品、指数、新闻、分析 | 企业 feeds 和 workflow，需按具体产品核验许可和新闻展示权 |
| Bloomberg / BLPAPI | BLPAPI SDK, Server API, B-Pipe, licensed Desktop API | 股票、债券、FX、商品、衍生品、指数、新闻、分析 | Bloomberg 生态接入，依赖现有合同和 API 权限 |

## 验证计划

| 阶段 | 目标 | 输出 |
| --- | --- | --- |
| V0 清单核验 | 核对 P0/P1 provider 的 docs、价格、授权、rate limit、MCP/API 状态 | 更新数据源矩阵和风险字段 |
| V1 接口 smoke test | 对 P0 provider 拉取代表性 symbol/token/series/wallet/query | 形成 connector 可用性报告和样例响应 |
| V2 标准化验证 | 映射 symbol、chain、token、financial statement、macro series、news event | 形成 normalized schema 草案 |
| V3 授权验证 | 逐项确认展示、缓存、二次分发、derived data、全文新闻、交易所费用 | 形成 entitlement policy |
| V4 生产候选 | 压测 rate limit、缓存、失败重试、freshness monitor、成本模型 | 决定默认源、备用源和付费源 |

## 关键技术风险

- 授权风险：市场数据和新闻数据通常有展示、导出、缓存和二次分发限制。
- 延迟风险：研究 API、延迟行情和交易级实时行情不能混用。
- 字段标准化风险：股票、Crypto、链上、宏观和新闻事件的数据模型差异很大。
- MCP 风险：有 MCP server 不等于生产可用，需要验证鉴权、工具粒度、超时、审计和错误处理。
- 供应商锁定：Crypto 情报源的标签、mindshare 和 Smart Money 指标很难迁移。
- 成本风险：机构源、实时交易所数据、新闻归档和链上查询都可能快速放大成本。
- A 股连接器风险：mootdx、AKShare、pywencai、腾讯财经非官方接口的数据可用性不等于可授权商用。Connector registry 必须记录 `provider_type`、`commercial_use_status`、`risk_level`、原始数据源、限频、cookie/登录态要求和替代授权源。

## A 股/中国市场补充核验

| Source | 技术结论 | 生产建议 |
| --- | --- | --- |
| mootdx | 可读取通达信离线数据、线上行情、K 线、指数、分钟数据和财务文件；更像 TDX 协议/文件读取连接器 | 标记为 `open_source_connector` 和 `research_only`；生产行情需替换为授权源 |
| 腾讯财经 | 个股和行情中心页面可作为页面级交叉验证；社区常用 `qt.gtimg.cn` 等接口不属于已确认官方公开 API | 标记为 `web_page_source_and_unofficial_endpoint`；只用于低风险研究观察 |
| AKShare | 覆盖多资产公开数据采集和清洗，可通过 Python/AKTools 使用 | 标记为 `open_source_data_connector`；每个子接口单独记录原始来源和授权边界 |
| SuperMind query_iwencai | 官方研究环境函数，支持自然语言选股和多 domain；有调用限制，官方提示更适合实时选股验证 | 标记为 `official_platform_function`；用于候选池生成，不直接进入回测核心 |
| pywencai | 社区库，依赖 cookie 和页面策略，适合低频个人研究 | 标记为 `unofficial_open_source_connector`；生产禁用或只保留手动研究工具 |
| TuShare Pro ths_hot | 提供同花顺热榜结构化数据，覆盖热股、板块、ETF、可转债、期货、港股、基金、美股等 | 可作为热点模块候选；商业展示前确认同花顺授权和 TuShare 权限 |

## 官方来源索引

| Provider | URLs |
| --- | --- |
| OpenBB | https://docs.openbb.co/odp/python/extensions/providers, https://docs.openbb.co/odp/python/extensions/interface/openbb-mcp, https://github.com/OpenBB-finance/OpenBB |
| Surf / AskSurf | https://docs.asksurf.ai/overview, https://github.com/asksurf-ai/surf-skills, https://agents.asksurf.ai/llms.txt |
| Massive.com / Polygon.io | https://massive.com/docs, https://massive.com/docs/rest/options/overview, https://massive.com/docs/rest/stocks/tickers/all-tickers |
| Financial Modeling Prep | https://site.financialmodelingprep.com/developer/docs, https://site.financialmodelingprep.com/, https://site.financialmodelingprep.com/datasets/market-news |
| Finnhub | https://finnhub.io/docs/api, https://finnhub.io/, https://finnhub.io/docs/api/quote |
| Twelve Data | https://twelvedata.com/, https://twelvedata.com/docs, https://twelvedata.com/fundamentals |
| Alpha Vantage | https://www.alphavantage.co/documentation/, https://www.alphavantage.co/, https://mcp.alphavantage.co/ |
| EODHD | https://eodhd.com/, https://eodhd.com/financial-apis/quick-start-with-our-financial-data-apis, https://eodhd.com/financial-apis/mcp-server-for-financial-data-by-eodhd |
| Intrinio | https://intrinio.com/, https://docs.intrinio.com/documentation/api_v2/getting_started, https://github.com/intrinio/python-sdk |
| Nasdaq Data Link | https://docs.data.nasdaq.com/, https://docs.data.nasdaq.com/docs/getting-started, https://www.nasdaq.com/solutions/data/nasdaq-data-link/api |
| SEC EDGAR | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |
| FRED | https://fred.stlouisfed.org/docs/api/fred/, https://fredhelp.stlouisfed.org/fred/about/about-fred/what-is-fred/ |
| Benzinga | https://www.benzinga.com/apis/, https://www.benzinga.com/apis/cloud-product/analyst-ratings-api/, https://docs.benzinga.com/ws-reference/introduction |
| Dune | https://docs.dune.com/data-catalog/overview, https://docs.dune.com/data-catalog/curated/overview, https://docs.dune.com/ |
| DefiLlama | https://api-docs.defillama.com/, https://defillama.com/, https://docs.llama.fi/ |
| Messari | https://messari.io/api, https://docs.messari.io/introduction, https://docs.messari.io/api-reference/endpoints/token-unlocks/token-unlocks-api |
| CoinGecko | https://docs.coingecko.com/, https://www.coingecko.com/en/api, https://www.coingecko.com/en/api/dex |
| Nansen | https://nansen.ai/api, https://docs.nansen.ai/, https://docs.nansen.ai/api/smart-money, https://docs.nansen.ai/api/profiler/address-labels |
| Arkham | https://intel.arkm.com/api/, https://intel.arkm.com/api/docs, https://info.arkm.com/announcements/the-new-arkham-api |
| Kaito | https://docs.kaito.ai/kaito-pro-ai-platform, https://kaito-ai.gitbook.io/product-docs/overview/use-cases-project-teams |
| Santiment | https://academy.santiment.net/metrics/, https://academy.santiment.net/for-developers/, https://app.santiment.net/ |
| TuShare Pro | https://tushare.pro/, https://tushare.pro/document/2, https://tushare.pro/document/2?doc_id=25, https://tushare.pro/document/2?doc_id=320, https://tushare.pro/wctapi/documents/320.md |
| AKShare | https://akshare.akfamily.xyz/, https://akshare.akfamily.xyz/introduction.html, https://akshare.akfamily.xyz/data/stock/stock.html, https://github.com/akfamily/akshare |
| SuperMind query_iwencai | https://quant.10jqka.com.cn/view/help/4, https://quant.10jqka.com.cn/view/dataplatform/detail/398, https://www.iwencai.com/ |
| mootdx | https://github.com/mootdx/mootdx, https://gitee.com/ibopo/mootdx, https://mootdx.readthedocs.io/ |
| 腾讯财经 | https://stockapp.finance.qq.com/, https://gu.qq.com/ |
| pywencai | https://github.com/zsrl/pywencai |
| JoinQuant / JQData | https://www.joinquant.com/help/api/doc?name=JQDatadoc, https://www.joinquant.com/help/api/doc?id=10292&name=JQDatadoc |
| FactSet | https://developer.factset.com/, https://developer.factset.com/api-catalog, https://developer.factset.com/api-catalog/factset-fundamentals-api |
| LSEG Data & Analytics | https://www.lseg.com/en/data-analytics |
| Bloomberg / BLPAPI | https://www.bloomberg.com/professional/support/api-library/ |

## 下一步技术调研

- 为 P0 provider 建立 connector smoke test，覆盖 symbol、token、filing、macro series、on-chain query 和 news event。
- 设计 provider registry 和 entitlement policy 的字段。
- 对 MCP provider 做生产可用性检查：鉴权、超时、错误结构、工具粒度、审计日志。
- 对实时行情和新闻源单独核对商用展示与二次分发条款。
