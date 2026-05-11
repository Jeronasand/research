# AiToEarn Platform Research

Current version: v0.2.0
Status: active
Last updated: 2026-05-11

中文版本: `README.zh-CN.md`

## Scope

This research covers the public AiToEarn product at `https://aitoearn.cn/zh-CN`, the international site, official docs, GitHub repository, pricing docs, changelog, and status page.

Product research and technical research are maintained separately:

- Product research: `product.md`
- Technical research: `technical.md`

## Key Findings

- AiToEarn positions itself as an open-source, AI-powered social media and content monetization platform for creators, brands, small teams, and one-person companies.
- The product is broader than a promotion marketplace: the public materials present four pillars: Monetize, Publish, Engage, and Create.
- The China website foregrounds task-based earning through creator promotion tasks, while the international website mirrors the same model in USD and emphasizes global social channels.
- The product has a strong open-source signal: public GitHub repository, MIT license, self-hosting via Docker Compose, MCP/SSE integration endpoints, and desktop/client references.
- Documentation and release channels are not fully aligned: the help changelog shows v2.4.0 on 2026-04-29, while the GitHub Releases panel observed through the repository page showed v2.1.0 as latest on 2026-03-28.
- Operational risk needs follow-up: the official status page reported active issues and very low displayed uptime for multiple products in its current public view.

## Research Files

| Area | Current File | Version Snapshot |
| --- | --- | --- |
| Product | `product.md` | `versions/product/v0.2.0.md` |
| Technical | `technical.md` | `versions/technical/v0.2.0.md` |

## Open Questions

- Product: task quality, creator settlement, advertiser refund/appeal, and advertising disclosure need logged-in validation.
- Technical: deployment topology, data model, MCP tool surface, OAuth/channel configuration, and SaaS availability need repository and runtime validation.

## Next Research Steps

- Continue product research in `product.md`.
- Continue technical research in `technical.md`.
- Keep product and technical version snapshots separate under `versions/product/` and `versions/technical/`.

## Sources

- AiToEarn China site: https://aitoearn.cn/zh-CN, accessed 2026-05-11.
- AiToEarn international site: https://aitoearn.ai/en, accessed 2026-05-11.
- Official docs index: https://docs.aitoearn.ai/llms.txt, accessed 2026-05-11.
- What is Aitoearn: https://docs.aitoearn.ai/en/help-center/getting-started/4-what-is-aitoearn, accessed 2026-05-11.
- Publishing guide: https://docs.aitoearn.ai/en/help-center/getting-started/3-getting-started-with-aitoearn-publishing-features, accessed 2026-05-11.
- Engagement guide: https://docs.aitoearn.ai/en/help-center/getting-started/8-getting-started-with-aitoearn-engagement-features, accessed 2026-05-11.
- Analytics guide: https://docs.aitoearn.ai/en/help-center/getting-started/7-getting-started-with-aitoearn-analytics-features, accessed 2026-05-11.
- Changelog: https://docs.aitoearn.ai/en/changelog/changelog, accessed 2026-05-11.
- Pricing: https://docs.aitoearn.ai/en/help-center/pricing/pricing, accessed 2026-05-11.
- Credits pricing: https://docs.aitoearn.ai/en/help-center/pricing/credits-price, accessed 2026-05-11.
- GitHub repository: https://github.com/yikart/AiToEarn, accessed 2026-05-11.
- Status page: https://status.aitoearn.ai/, accessed 2026-05-11.
