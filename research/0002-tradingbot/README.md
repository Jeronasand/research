# TradingBot Data Source Research

Current version: v0.2.0
Status: active
Last updated: 2026-05-11

中文版本: `README.zh-CN.md`

## Scope

This research item tracks candidate financial, crypto, equity, macro, on-chain, news, and agent-facing data sources for TradingBot.

The seed catalog comes from the user-provided schema:

- schema version: `0.2`
- last verified at: `2026-05-11`
- scope: `financial_crypto_equity_data_sources`

Product research and technical research are maintained separately:

- Product research: `product.md`
- Technical research: `technical.md`

## Key Findings

- TradingBot should treat data as a layered sourcing problem, not as a single-vendor choice.
- P0 candidates cover aggregation, market data, official filings, macro data, on-chain analytics, DeFi metrics, crypto market data, and crypto research.
- Crypto intelligence needs a separate baseline because Surf / AskSurf, Dune, DefiLlama, Messari, CoinGecko, Nansen, Arkham, Kaito, and Santiment solve different parts of the problem.
- Most listed sources provide structured financial or crypto data. They should not be treated as general web search providers.
- Commercial display, redistribution, exchange fees, API rate limits, data freshness, and MCP production readiness are the main validation blockers.
- China-market supplement sources need sharper labels: mootdx, AKShare, pywencai, and Tencent Finance page/unofficial endpoints are research or prototype connectors, not licensed production market-data vendors.
- Tonghuashun-related sources should be split into official SuperMind `query_iwencai`, the unofficial `pywencai` connector, and TuShare Pro `ths_hot` for structured hot-ranking data.

## Details

| Area | Current files | Version snapshots |
| --- | --- | --- |
| Product | `product.md` | `versions/product/v0.2.0.md` |
| Technical | `technical.md` | `versions/technical/v0.2.0.md` |

## Open Questions

- Which P0 sources should be used for the first TradingBot prototype versus reserved for paid validation?
- Which sources allow user-facing display, derived data, and redistribution in the intended product?
- Which providers can support production MCP or agent workflows rather than only developer experiments?
- Which crypto-only intelligence sources should become core product dependencies rather than research references?

## Sources

- User-provided data-source catalog, schema version `0.1`, last verified at 2026-05-11.
- User-provided supplement and correction catalog, schema version `0.2`, last verified at 2026-05-11.
- Provider official source URLs are tracked in `technical.md`.
