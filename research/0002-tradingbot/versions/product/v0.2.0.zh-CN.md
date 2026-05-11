# TradingBot 金融/Crypto/股票数据源产品调研

当前版本: v0.2.0
状态: active
最后更新: 2026-05-11

English version: `product.md`

## 范围

本文从产品视角整理 TradingBot 的金融、股票、期权、宏观、Crypto、链上、新闻和 Agent 数据源候选。技术接入方式、鉴权、数据形态和接口验证计划单独维护在 `technical.zh-CN.md`。

本版本按用户提供的 `financial_crypto_equity_data_sources` 清单和 `0.2` 补充修正入库，清单标注的 `last_verified_at` 为 2026-05-11。本轮重点核对 A 股/中国市场相关补充源：mootdx、腾讯财经、AKShare、i问财/SuperMind、pywencai、TuShare Pro `ths_hot`。

## 产品结论

- 数据源应分为聚合层、行情层、官方底层源、Crypto 专项情报、A 股/中国市场补充、机构终局源六类。
- 首个产品原型建议以 P0 数据源为主：OpenBB、Surf / AskSurf、Massive / Polygon、Financial Modeling Prep、Finnhub、Twelve Data、Alpha Vantage、SEC EDGAR、FRED、Dune、DefiLlama、Messari、CoinGecko。
- Crypto 侧没有单一数据源能同时覆盖价格、DEX、DeFi 基本面、链上 SQL、钱包画像、实体归因、社交情绪和研究报告，应以组合方式验证。
- 股票和传统金融侧需要同时验证行情延迟、交易所授权、基本面字段质量、新闻展示权和二次分发条款。
- P2 机构源 FactSet、LSEG、Bloomberg 适合作为长期终局方案或企业客户方案，不适合作为早期低成本默认依赖。
- 中国市场补充源不能只按“能取到数据”判断。AKShare、mootdx、pywencai、腾讯财经非官方接口更适合研究和原型；生产级行情和可展示数据需要优先验证 TuShare/聚宽/授权供应商或交易所授权源。
- 同花顺生态需要分层：SuperMind `query_iwencai` 是官方研究环境能力，适合自然语言选股；TuShare Pro `ths_hot` 是热榜结构化数据入口；pywencai 是社区连接器，风险更高。

## 推荐分层

| 层级 | 候选 | 产品用途 | 决策原则 |
| --- | --- | --- | --- |
| R0 原型底座 | OpenBB, FMP, Finnhub, Twelve Data, SEC EDGAR, FRED, CoinGecko, DefiLlama, Dune | 快速覆盖股票、宏观、Crypto 价格、DeFi、链上分析和基础研究 | 先验证 API 可用性、免费/低成本额度、字段标准化成本 |
| R1 核心增强 | Massive / Polygon, Alpha Vantage, Messari, Surf / AskSurf, Benzinga, EODHD | 实时行情、新闻、Crypto 研究、Agent 数据 API 和产品差异化 | 按延迟、授权、展示权、MCP/Agent 可生产性筛选 |
| R2 专项情报 | Nansen, Arkham, Kaito, Santiment, Intrinio, Nasdaq Data Link, TuShare, AKShare, JQData, SuperMind i问财, TuShare ths_hot | 钱包画像、实体归因、社交叙事、基本面、另类数据、中国市场、A 股热点 | 先验证目标场景是否真的需要，再评估价格和商用边界 |
| R2 研究连接器 | mootdx, pywencai, 腾讯财经页面/非官方接口 | A 股通达信数据、问财查询、腾讯行情页面交叉验证 | 仅用于研究/原型和交叉校验，不作为生产主数据源 |
| R3 机构终局 | FactSet, LSEG, Bloomberg | 大型投研、合规金融数据、企业级客户集成 | 只在已有客户需求或合同预算时推进 |

## 候选数据源清单

| 优先级 | Provider | 模块 | 资产覆盖 | 最适合 | 产品验证重点 |
| --- | --- | --- | --- | --- | --- |
| P0 | OpenBB | 聚合层 / Agent 层 | 股票、ETF、期权、宏观、外汇、Crypto、自定义数据 | 多源编排、AI 金融工作流、研究仪表盘、内部数据接入层 | provider 覆盖、MCP 生产可用性、第三方授权、自定义私有数据 |
| P0 | Surf / AskSurf | Crypto 竞品基线 | Crypto、Token、钱包、链上、预测市场 | Crypto Agent 数据层、Token/Wallet/Market 综合查询、竞品基线 | 是否能扩展到传统金融、200+ sources 明细、刷新频率、商业授权 |
| P0 | Massive.com / Polygon.io | 美股 / 期权 / 跨资产行情 | 股票、期权、期货、指数、外汇、Crypto、经济、另类数据 | 实时行情核心源、历史行情归档、交易应用、量化回测 | 交易所费用、二次分发、期权/期货延迟、品牌和合同主体 |
| P0 | Financial Modeling Prep | 股票行情 + 基本面 | 股票、指数、外汇、Crypto、ETF | 投资研究 App、Dashboard、股票基本面、新闻补充 | 财务数据一致性、实时行情延迟、rate limit、商用展示 |
| P0 | Finnhub | 股票 / 经济 / 另类数据 | 股票、外汇、Crypto、经济数据、另类数据 | 综合金融 API、全球市场原型、基本面和行情结合 | 市场权限、全球覆盖、免费层历史限制、WebSocket 稳定性 |
| P0 | Twelve Data | 全球股票 / ETF / FX / Crypto | 股票、ETF、外汇、Crypto、指数、基本面 | 跨市场行情、全球股票覆盖、研究和交易系统 | 交易所覆盖、实时延迟、企业授权、基本面深度 |
| P0 | Alpha Vantage | 股票 / 期权 / 技术指标 | 股票、ETF、基金、指数、期权、外汇、Crypto、商品、经济指标 | 开发者友好 API、技术指标、MCP Agent 接入、原型验证 | 免费额度、premium 实时数据、期权覆盖、MCP 工具粒度 |
| P1 | EODHD | 股票 / ETF / Options / News | 股票、ETF、基金、外汇、指数、债券、期权、Crypto | 成本可控的广覆盖金融数据、EOD/历史数据、AI Agent 接入 | 交易所授权、US options 深度、MCP 鉴权、商用展示 |
| P1 | Intrinio | 股票基本面 / 期权 | 股票、期权、ETF、基本面、新闻 | 美股基本面、期权数据、金融数据 marketplace、企业接入 | 数据包价格、期权场景、财报标准化、转售条款 |
| P1 | Nasdaq Data Link | 金融 / 经济 / 另类数据市场 | 股票、指数、经济、另类、金融数据 | 数据 marketplace、另类数据、机构采购、实时交易所数据 | dataset 价格、二次分发、交易所费用、更新频率 |
| P0 | SEC EDGAR | 美股财报 / Filings | 美股上市公司、filings、fundamentals | 免费美股财报底层源、10-K/10-Q/8-K、公司事实数据 | XBRL 清洗成本、taxonomy 差异、User-Agent 规范、第三方 parser |
| P0 | FRED | 宏观数据 | 经济指标、利率、通胀、GDP、就业、宏观序列 | 宏观因子、资产配置、金融研究 | 国家和指标覆盖、修订历史、ALFRED vintage data、API key/rate limit |
| P1 | Benzinga | 新闻 / 分析师评级 | 股票、市场新闻、评级、价格目标 | 股票新闻、分析师评级、事件驱动策略 | 新闻延迟、历史归档价格、全文/摘要展示权、覆盖券商 |
| P0 | Dune | On-chain SQL | Crypto、区块链、Token、DEX、NFT、稳定币、桥、预测市场 | 链上数据仓库、SQL 分析、自定义 Dashboard | 目标链覆盖、查询成本、curated tables 刷新、商业导出限制 |
| P0 | DefiLlama | DeFi 基本面 | DeFi 协议、稳定币、桥、收益率 | 免费/低成本 DeFi 数据、TVL/Fees/Revenue/Yields | Free/Pro 差异、API SLA、adapter 质量、商业展示 |
| P0 | Messari | Crypto 市场 / 研究 | Crypto、Token、DeFi、新闻、研究 | Crypto 基本面、研究报告、新闻聚合、Token unlock/fundraising | API 价格、新闻/研究展示权、unlock 准确性、批量历史下载 |
| P0 | CoinGecko | Crypto 价格 / DEX | Crypto、Token、交易所、DEX、链上池 | Crypto 价格、Token metadata、DEX liquidity/pools、交易所数据 | 商业 API 价格、刷新频率、DEX 覆盖、高频交易适配性 |
| P1 | Nansen | 钱包 / Smart Money | Crypto、钱包、Token、链上 | 钱包画像、聪明钱追踪、holder analysis、链上投资情报 | 地址标签准确性、Smart Money 定义、链和 token 覆盖、credit 机制 |
| P1 | Arkham | Entity / 地址归因 | Crypto、钱包、实体、交易 | 链上实体识别、资金流追踪、KYC/AML 辅助、Whale monitoring | 实体归因准确性、合规限制、credit pricing、目标链覆盖 |
| P1 | Kaito | Crypto 社交 / Mindshare | Crypto、社交数据、叙事、项目、Token | 叙事分析、KOL/社区热度、Mindshare tracking、Social KPI | API 开放度、中文/英文覆盖、Telegram/KOL 边界、指标定义 |
| P1 | Santiment | Crypto 社交 / Dev / On-chain | Crypto、Token、社交、链上、开发活跃度 | 情绪指标、开发活跃度、链上指标、Crypto 因子研究 | 指标定义、GraphQL 查询成本、social 覆盖、历史长度 |
| P1 | TuShare Pro / ths_hot | A股 / 同花顺热点 / 热榜 | 热股、概念板块、ETF、可转债、行业板块、期货、港股、热基、美股 | A股热点追踪、同花顺热股榜、散户关注度和题材热度分析 | TuShare 积分、刷新频率、同花顺商业授权、热度口径解释 |
| P1 | AKShare | A股 / 多资产开源采集连接器 | 股票、期货、期权、基金、外汇、债券、指数、Crypto | 原型验证、多数据源交叉验证、A股数据探索、非正式数据补充、学术研究 | 原始数据源授权、接口维护成本、生产稳定性、商业展示和再分发 |
| P1 | SuperMind query_iwencai | A股 / 自然语言选股 / 同花顺问财 | A股、基金、指数、新三板、港股、美股 | 中文自然语言选股、快速生成股票候选池、投研 Agent 选股工具 | 官方平台授权、调用次数、问句可复现性、回测适配性 |
| P1 | JoinQuant / JQData | A股量化平台 | 股票、期货、基金、期权、债券、宏观 | A股量化研究、回测、分钟行情、中国资产数据 | API 权限、商用限制、分钟数据覆盖、复权逻辑 |
| P2 | mootdx | A股 / 通达信协议连接器 | A股、指数、通达信扩展市场、通达信财务文件 | A股本地研究、通达信离线/线上数据读取、个人量化研究 | 项目非商用声明、通达信数据授权、服务器稳定性、生产替代源 |
| P2 | 腾讯财经 | A股 / 港股 / 美股行情页面源 | A股、港股、美股、指数、基金、外汇、期货、黄金 | 行情页面交叉验证、热门股票和资金流页面观察、非生产原型 | 未确认公开官方股票 API、字段稳定性、授权和反爬风险 |
| P2 | pywencai | A股 / i问财社区连接器 | A股、指数、基金、港股、美股、新三板、可转债、期货、外汇等 | 个人研究、自然语言选股原型、非正式问财数据采集 | 非官方连接器、cookie 管理、限频、登录策略变化、商用法律风险 |
| P2 | FactSet | 机构级金融数据 | 股票、基本面、估值、持仓、固收、组合、行情 | 机构级终局方案、大型投研系统、企业级集成 | 采购成本、合同限制、内容集授权、集成复杂度 |
| P2 | LSEG Data & Analytics | 机构级金融数据 | 股票、固收、FX、商品、指数、新闻、分析 | 机构级金融数据、市场数据 feeds、合规投研系统 | API 产品许可、交易所费用、新闻展示权、derived data 条款 |
| P2 | Bloomberg / BLPAPI | 机构级金融数据 | 股票、债券、FX、商品、衍生品、指数、新闻、分析 | Bloomberg 生态集成、交易和投研终端数据 | 合同、Desktop/Server/B-Pipe 权限、导出限制、成本复杂度 |

## 新闻和搜索能力边界

- 市场新闻候选：Financial Modeling Prep、Benzinga、Messari、Alpha Vantage、Finnhub、EODHD、Intrinio。
- Crypto 搜索/社交/研究候选：Surf / AskSurf、Messari、Kaito、Santiment。
- 非通用搜索源：SEC EDGAR、FRED、Dune、DefiLlama、CoinGecko、Nansen、Arkham、TuShare、AKShare、JQData 主要提供结构化数据或领域指标。
- OpenBB 更像聚合和编排层，不应被当作全网搜索源。

## 中国市场补充修正

| 数据源 | 产品定位 | 适合放入 TradingBot 的方式 | 不适合作为 |
| --- | --- | --- | --- |
| mootdx | A 股 / 通达信协议连接器 / 研究用途 | 个人研究、通达信本地数据读取、A 股原型验证 | 正式授权行情源、商业主行情源 |
| 腾讯财经 | 行情页面源 / 非官方接口源 | 页面级行情、资金流、热门股票、新闻公告研报的交叉验证 | 生产级公开 API、可 SLA 的行情源 |
| AKShare | 开源采集/清洗连接器 | 多资产研究、A 股补充、公开页面数据快速接入 | 授权数据供应商、可再分发底座 |
| SuperMind query_iwencai | 官方研究环境里的自然语言选股函数 | 中文选股 Agent、实时选股想法验证、候选池生成 | 直接回测底座、通用 Web Search |
| pywencai | 社区问财连接器 | 个人研究、低频原型验证 | 商业生产源、高频采集源 |
| TuShare Pro ths_hot | 同花顺热榜结构化入口 | 热点题材、散户关注度、热股/板块榜 | 唯一交易信号、未经授权的商业展示源 |

## 下一步产品调研

- 先为 P0 数据源建立最小可用矩阵：覆盖资产、免费/付费限制、展示权、刷新频率、是否支持 Agent/MCP。
- 明确 TradingBot R1 需要展示给终端用户的数据字段，倒推数据授权和二次分发风险。
- 对 Crypto intelligence 做单独产品评估：价格/DEX、DeFi 基本面、链上 SQL、钱包画像、实体归因、社交叙事分别验证。
- 对股票/期权数据做延迟和交易所授权验证，避免把研究 API 误用成交易级行情。

## 来源

- 用户提供的数据源清单，schema version `0.1`，last verified at 2026-05-11。
- 用户补充的数据源修正清单，schema version `0.2`，last verified at 2026-05-11。
- 各 provider 官方 URL 见 `technical.zh-CN.md` 的官方来源索引。
