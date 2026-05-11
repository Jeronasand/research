# TradingBot 数据源调研

当前版本: v0.2.0
状态: active
最后更新: 2026-05-11

English version: `README.md`

## 范围

本调研项记录 TradingBot 的金融、Crypto、股票、宏观、链上、新闻和 Agent 数据源候选清单。

种子清单来自用户提供的结构化 schema：

- schema version: `0.2`
- last verified at: `2026-05-11`
- scope: `financial_crypto_equity_data_sources`

产品调研和技术调研分开维护：

- 产品调研：`product.zh-CN.md`
- 技术调研：`technical.zh-CN.md`

## 关键结论

- TradingBot 的数据层应按多源分层设计，而不是押注单一供应商。
- P0 候选覆盖聚合层、市场行情、官方财报、宏观数据、链上分析、DeFi 指标、Crypto 市场数据和 Crypto 研究数据。
- Crypto intelligence 需要单独基线，因为 Surf / AskSurf、Dune、DefiLlama、Messari、CoinGecko、Nansen、Arkham、Kaito、Santiment 解决的是不同问题。
- 大多数数据源提供的是结构化金融或 Crypto 数据，不应被当作通用 Web search。
- 商用展示、二次分发、交易所费用、API rate limit、数据刷新频率和 MCP 生产可用性是主要验证阻塞点。
- A 股/中国市场补充源需要明确拆开：mootdx、AKShare、pywencai、腾讯财经页面/非官方接口都适合研究或原型，不应被写成正式授权行情源。
- 同花顺相关源需要拆成官方 SuperMind `query_iwencai` 与社区库 `pywencai`；TuShare Pro `ths_hot` 可作为同花顺热榜结构化入口，但商业用途仍需同花顺授权。

## 调研文件

| 方向 | 当前文件 | 版本快照 |
| --- | --- | --- |
| 产品 | `product.zh-CN.md` | `versions/product/v0.2.0.zh-CN.md` |
| 技术 | `technical.zh-CN.md` | `versions/technical/v0.2.0.zh-CN.md` |

## 待确认问题

- 哪些 P0 数据源进入 TradingBot 首个原型，哪些只保留为付费验证候选？
- 哪些数据源允许面向用户展示、派生数据和二次分发？
- 哪些 provider 的 MCP 或 Agent 工作流可以进入生产，而不是只适合开发者试验？
- 哪些 Crypto-only 情报源应成为核心产品依赖，哪些只作为研究参考？

## 来源

- 用户提供的数据源清单，schema version `0.1`，last verified at 2026-05-11。
- 用户补充的数据源修正清单，schema version `0.2`，last verified at 2026-05-11。
- 各 provider 官方来源 URL 统一记录在 `technical.zh-CN.md`。
