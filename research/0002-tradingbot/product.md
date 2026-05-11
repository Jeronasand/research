# TradingBot Financial/Crypto/Equity Data Source Product Research

Current version: v0.2.0
Status: active
Last updated: 2026-05-11

中文版本: `product.zh-CN.md`

## Scope

This document organizes TradingBot candidate data sources from a product perspective: financial market data, equities, options, macro data, crypto, on-chain analytics, news, and agent-facing data APIs. Technical integration, authentication, data shapes, and validation plans are maintained in `technical.md`.

This version records the user-provided `financial_crypto_equity_data_sources` catalog plus the `0.2` supplement and corrections. The catalog marks `last_verified_at` as 2026-05-11. This pass focused live verification on China-market supplement sources: mootdx, Tencent Finance, AKShare, iWenCai / SuperMind, pywencai, and TuShare Pro `ths_hot`.

## Product Findings

- TradingBot should separate data sources into aggregation, market data, official baseline data, crypto intelligence, China-market supplements, and institutional end-state sources.
- The first prototype should focus on P0 candidates: OpenBB, Surf / AskSurf, Massive / Polygon, Financial Modeling Prep, Finnhub, Twelve Data, Alpha Vantage, SEC EDGAR, FRED, Dune, DefiLlama, Messari, and CoinGecko.
- On the crypto side, no single source covers price, DEX, DeFi fundamentals, on-chain SQL, wallet intelligence, entity attribution, social sentiment, and research reports. A combined sourcing strategy is required.
- On the equity and traditional finance side, TradingBot must validate market-data latency, exchange entitlements, fundamental-data quality, news display rights, and redistribution terms.
- P2 institutional sources such as FactSet, LSEG, and Bloomberg are better treated as long-term or enterprise options, not early default dependencies.
- China-market supplement sources should not be evaluated only by whether data can be fetched. AKShare, mootdx, pywencai, and Tencent Finance unofficial endpoints are better suited to research and prototypes; production market data and user-facing display need licensed vendors, TuShare / JoinQuant validation, or exchange-authorized sources.
- The Tonghuashun ecosystem needs separate entries: SuperMind `query_iwencai` is an official research-environment function for natural-language stock screening; TuShare Pro `ths_hot` is a structured hot-ranking entry point; `pywencai` is an unofficial community connector with materially higher risk.

## Recommended Layers

| Layer | Candidates | Product use | Decision rule |
| --- | --- | --- | --- |
| R0 prototype base | OpenBB, FMP, Finnhub, Twelve Data, SEC EDGAR, FRED, CoinGecko, DefiLlama, Dune | Fast coverage for equities, macro, crypto prices, DeFi, on-chain analytics, and baseline research | Validate API availability, free/low-cost quotas, and normalization cost |
| R1 core enhancement | Massive / Polygon, Alpha Vantage, Messari, Surf / AskSurf, Benzinga, EODHD | Real-time market data, news, crypto research, agent data APIs, and product differentiation | Filter by latency, licensing, display rights, and MCP/agent production readiness |
| R2 specialized intelligence | Nansen, Arkham, Kaito, Santiment, Intrinio, Nasdaq Data Link, TuShare, AKShare, JQData, SuperMind iWenCai, TuShare ths_hot | Wallet profiling, entity attribution, social narrative, fundamentals, alternative data, China market data, A-share hot rankings | Validate the target use case before pricing and commercial terms |
| R2 research connectors | mootdx, pywencai, Tencent Finance pages / unofficial endpoints | A-share TDX data, iWenCai query access, Tencent quote-page cross-checks | Use only for research/prototypes and cross-checking, not as primary production sources |
| R3 institutional end state | FactSet, LSEG, Bloomberg | Large-scale research, compliant financial data, enterprise customer integrations | Advance only when there is contract budget or customer demand |

## Candidate Data Sources

| Priority | Provider | Module | Asset coverage | Best for | Product validation focus |
| --- | --- | --- | --- | --- | --- |
| P0 | OpenBB | Aggregation / Agent layer | Stocks, ETF, options, macro, forex, crypto, custom data | Multi-source orchestration, AI finance workflows, research dashboards, internal data layer | Provider coverage, MCP production readiness, third-party licensing, private data integration |
| P0 | Surf / AskSurf | Crypto competitor baseline | Crypto, tokens, wallets, on-chain, prediction markets | Crypto agent data layer, token/wallet/market query, competitor baseline | Traditional-finance expansion, details behind 200+ sources, refresh frequency, commercial terms |
| P0 | Massive.com / Polygon.io | US equities / options / cross-asset market data | Stocks, options, futures, indices, forex, crypto, economy, alternative data | Real-time market-data core, historical archive, trading apps, quant backtesting | Exchange fees, redistribution, options/futures latency, brand and contract entity |
| P0 | Financial Modeling Prep | Equity prices + fundamentals | Stocks, indices, forex, crypto, ETF | Investment research app, dashboard, equity fundamentals, news supplement | Financial-statement consistency, real-time latency, rate limits, commercial display |
| P0 | Finnhub | Stocks / economy / alternative data | Stocks, forex, crypto, economic data, alternative data | General finance API, global-market prototype, fundamentals plus prices | Market entitlements, global depth, free-tier historical limits, WebSocket stability |
| P0 | Twelve Data | Global stocks / ETF / FX / crypto | Stocks, ETF, forex, crypto, indices, fundamentals | Cross-market prices, global equity coverage, research and trading systems | Exchange coverage, real-time latency, enterprise licensing, fundamental depth |
| P0 | Alpha Vantage | Stocks / options / technical indicators | Stocks, ETF, funds, indices, options, forex, crypto, commodities, economic indicators | Developer-friendly finance API, technical indicators, MCP agent access, prototyping | Free quota, premium real-time data, options coverage, MCP tool granularity |
| P1 | EODHD | Stocks / ETF / options / news | Stocks, ETF, funds, forex, indices, bonds, options, crypto | Cost-controlled broad coverage, EOD/historical data, AI agent access | Exchange entitlements, US options depth, MCP authentication, commercial display |
| P1 | Intrinio | Equity fundamentals / options | Stocks, options, ETF, fundamentals, news | US fundamentals, options data, data marketplace, enterprise access | Dataset price, options fit, statement normalization, resale terms |
| P1 | Nasdaq Data Link | Financial / economic / alternative data marketplace | Stocks, indices, economic data, alternative data, financial data | Data marketplace, alternative data, institutional procurement, exchange data | Dataset price, redistribution, exchange-data fee structure, update frequency |
| P0 | SEC EDGAR | US filings / fundamentals | US public companies, filings, fundamentals | Free baseline for filings, 10-K/10-Q/8-K parsing, company facts | XBRL cleaning cost, taxonomy differences, User-Agent rules, third-party parser need |
| P0 | FRED | Macro data | Economic indicators, rates, inflation, GDP, employment, macro series | Macro factors, asset allocation, financial research | Country and indicator coverage, revision history, ALFRED vintage data, API key/rate limit |
| P1 | Benzinga | News / analyst ratings | Stocks, market news, ratings, price targets | Equity news, analyst-rating signals, event-driven strategies | News latency, archive pricing, full-text/summary display rights, analyst coverage |
| P0 | Dune | On-chain SQL | Crypto, blockchains, tokens, DEX, NFT, stablecoins, bridges, prediction markets | On-chain warehouse, SQL analytics, custom dashboards | Chain coverage, query cost, curated-table freshness, commercial export limits |
| P0 | DefiLlama | DeFi fundamentals | DeFi protocols, stablecoins, bridges, yields | Free/low-cost DeFi metrics, TVL/fees/revenue/yields | Free vs Pro scope, API SLA, adapter quality, commercial display |
| P0 | Messari | Crypto market / research | Crypto, tokens, DeFi, news, research | Crypto fundamentals, research reports, news aggregation, token unlock/fundraising | API pricing, research/news display rights, unlock accuracy, bulk historical access |
| P0 | CoinGecko | Crypto prices / DEX | Crypto, tokens, exchanges, DEX, on-chain pools | Crypto prices, token metadata, DEX liquidity/pools, exchange data | Commercial API price, refresh frequency, DEX coverage, high-frequency suitability |
| P1 | Nansen | Wallet / Smart Money | Crypto, wallets, tokens, on-chain | Wallet profiling, Smart Money tracking, holder analysis, on-chain investment intelligence | Label accuracy, Smart Money definition, chain/token coverage, credit model |
| P1 | Arkham | Entity / address attribution | Crypto, wallets, entities, transactions | Entity resolution, fund-flow tracking, KYC/AML support, whale monitoring | Attribution accuracy, compliance limits, credit pricing, target-chain coverage |
| P1 | Kaito | Crypto social / mindshare | Crypto, social data, narratives, projects, tokens | Narrative analysis, KOL/community heat, mindshare tracking, social KPI | API availability, Chinese/English coverage, Telegram/KOL boundaries, metric definitions |
| P1 | Santiment | Crypto social / dev / on-chain | Crypto, tokens, social data, on-chain, developer activity | Sentiment metrics, development activity, on-chain indicators, crypto factor research | Metric definitions, GraphQL query cost, social coverage, historical depth |
| P1 | TuShare Pro / ths_hot | A-share / Tonghuashun hot rankings | Hot stocks, concept boards, ETF, convertible bonds, industry boards, futures, HK stocks, hot funds, US stocks | A-share hot-topic tracking, Tonghuashun hot-stock rankings, retail-attention signals | TuShare points, refresh frequency, Tonghuashun commercial authorization, hot-value explainability |
| P1 | AKShare | A-share / multi-asset open-source collection connector | Stocks, futures, options, funds, forex, bonds, indices, crypto | Prototyping, source cross-checking, A-share exploration, informal supplement, academic research | Original-source licensing, production stability, interface maintenance, commercial display and redistribution |
| P1 | SuperMind query_iwencai | A-share / natural-language stock screening / Tonghuashun iWenCai | A-shares, funds, indices, NEEQ, HK stocks, US stocks | Chinese natural-language screening, stock-candidate generation, research-agent stock tools | Platform authorization, call limits, query reproducibility, backtesting fit |
| P1 | JoinQuant / JQData | A-share quant platform | Stocks, futures, funds, options, bonds, macro | A-share quant research, backtesting, minute bars, China assets | API entitlements, commercial restrictions, minute-data coverage, adjustment logic |
| P2 | mootdx | A-share / TDX protocol connector | A-shares, indices, TDX extended markets, TDX financial files | A-share local research, TDX offline/online data reads, personal quant research | Non-commercial project notice, TDX data authorization, server stability, production replacement source |
| P2 | Tencent Finance | A-share / HK-share / US-share market page source | A-shares, HK stocks, US stocks, indices, funds, forex, futures, gold | Quote-page cross-checks, hot-stock and capital-flow page observation, non-production prototypes | No confirmed public official stock API, field stability, authorization, anti-scraping risk |
| P2 | pywencai | A-share / iWenCai community connector | A-shares, indices, funds, HK stocks, US stocks, NEEQ, convertible bonds, futures, forex, and more | Personal research, natural-language screening prototypes, informal iWenCai data collection | Unofficial connector, cookie handling, rate control, login-policy changes, legal risk for commercial use |
| P2 | FactSet | Institutional financial data | Stocks, fundamentals, estimates, ownership, fixed income, portfolio, market data | Institutional end state, large research systems, enterprise integration | Procurement cost, contract restrictions, content-set entitlements, integration complexity |
| P2 | LSEG Data & Analytics | Institutional financial data | Stocks, fixed income, FX, commodities, indices, news, analytics | Institutional finance data, market-data feeds, compliant research systems | API product licensing, exchange fees, news display rights, derived-data terms |
| P2 | Bloomberg / BLPAPI | Institutional financial data | Stocks, bonds, FX, commodities, derivatives, indices, news, analytics | Bloomberg ecosystem integration, trading and research terminal data | Contract status, Desktop/Server/B-Pipe entitlements, export limits, cost and complexity |

## News And Search Boundaries

- Market-news candidates: Financial Modeling Prep, Benzinga, Messari, Alpha Vantage, Finnhub, EODHD, Intrinio.
- Crypto search, social, and research candidates: Surf / AskSurf, Messari, Kaito, Santiment.
- Non-general-search sources: SEC EDGAR, FRED, Dune, DefiLlama, CoinGecko, Nansen, Arkham, TuShare, AKShare, and JQData mainly provide structured data or domain metrics.
- OpenBB is an aggregation and orchestration layer, not a general web search source.

## China-Market Supplement Corrections

| Source | Product label | TradingBot fit | Not suitable as |
| --- | --- | --- | --- |
| mootdx | A-share / TDX protocol connector / research use | Personal research, local TDX data reads, A-share prototype validation | Licensed market-data vendor, commercial primary quote source |
| Tencent Finance | Quote-page source / unofficial endpoint source | Page-level quotes, capital flows, hot stocks, news, announcements, and research-report cross-checking | Production public API, SLA-backed market-data source |
| AKShare | Open-source collection and cleaning connector | Multi-asset research, A-share supplements, quick access to public-page data | Licensed data vendor, redistribution foundation |
| SuperMind query_iwencai | Natural-language stock-screening function in an official research environment | Chinese stock-screening agent, real-time idea validation, candidate-list generation | Direct backtesting base, general web search |
| pywencai | Community iWenCai connector | Personal research, low-frequency prototype validation | Commercial production source, high-frequency collector |
| TuShare Pro ths_hot | Structured Tonghuashun hot-ranking entry point | Hot themes, retail attention, hot-stock and sector rankings | Sole trading signal, commercial display source without authorization |

## Next Product Research

- Build a minimum viable P0 matrix covering assets, free/paid limits, display rights, freshness, and agent/MCP support.
- Define the exact TradingBot R1 user-facing fields, then map those fields back to licensing and redistribution risk.
- Evaluate crypto intelligence by use case: price/DEX, DeFi fundamentals, on-chain SQL, wallet profiling, entity attribution, and social narrative.
- Validate equity/options latency and exchange entitlements before treating research APIs as trading-grade market data.

## Sources

- User-provided data-source catalog, schema version `0.1`, last verified at 2026-05-11.
- User-provided supplement and correction catalog, schema version `0.2`, last verified at 2026-05-11.
- Provider official URLs are indexed in `technical.md`.
