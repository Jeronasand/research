# AiToEarn Product Research

Current version: v0.2.0
Status: active
Last updated: 2026-05-11

中文版本: `product.zh-CN.md`

## Scope

This file covers AiToEarn's product positioning, user roles, marketplace model, business mechanics, pricing signals, competitive angle, and product risks. Technical architecture and deployment evidence live in `technical.md`.

## Product Positioning

AiToEarn is best understood as a creator-commerce operations platform that combines:

- a marketplace where advertisers publish promotion tasks and creators accept work;
- multi-platform publishing across Chinese and international social networks;
- AI-assisted engagement, comment search, replies, and scheduled interaction;
- AI content generation for copy, image, and video workflows;
- analytics and task performance reporting.

The platform appears to target creators/KOCs, small merchants, local businesses, social media operators, and AI-agent users who want an integrated workflow from content creation to distribution, interaction, and monetization.

## Public Product Surface

Observed public navigation includes:

- Gold Rush / task marketplace
- Content management
- AI check-in
- AI publish
- AI interaction
- Xiaohongshu data
- note/comment search
- browser extension state
- creator and advertiser entry points

The task marketplace exposes both creator-facing "accept task" behavior and advertiser-facing task publishing. Some tasks are available, while many historical tasks are sold out.

## Business And Settlement Model

The public pages and docs indicate these settlement models:

- `CPS`: cost per sale
- `CPE`: cost per engagement
- `CPM`: cost per thousand views
- fixed-price post or task rewards

Observed China marketplace examples on 2026-05-11 included:

- pinned Jimeng campaign: RMB 0.8 per valid interaction, with a single-post cap of RMB 20,000;
- Xiaohongshu CPE promotion tasks around RMB 100 per 1,000 engagements;
- Douyin/other historical CPM/CPE tasks;
- low-value engagement tasks such as likes, saves, and comments.

The international site showed a parallel USD marketplace with a pinned Jimeng campaign at USD 0.8 per interaction and a USD 20,000 per-post cap, plus fixed-price and CPM/CPE tasks.

Pricing docs show a Free plan and Plus plan, and a separate credits model where USD 15 buys 1,000 credits. Because those pricing pages are dated 2025-11 and the changelog has moved into 2026 releases, pricing should be revalidated before commercial decisions.

## Competitive Angle

AiToEarn is not just a scheduler competing with Buffer/Hootsuite-style products. Its more differentiated wedge is task-driven content monetization tied to AI-assisted content production and social engagement. The combination of promotion marketplace, creator workflow, and AI engagement makes it closer to an AI-agent-enabled creator operations stack.

## Product Risks And Open Questions

- Task quality and fraud control: task marketplaces need strong validation against fake engagement, low-quality traffic, duplicate submissions, and screenshot manipulation.
- Settlement trust: deposits, refunds, creator income, withdrawals, appeals, and manual re-review flows need auditability.
- Compliance: paid promotion and local-business campaigns may need advertising disclosure, platform-specific compliance, and regional payment/withdrawal checks.
- Pricing freshness: pricing docs appear older than the latest changelog and should be verified in-app before commercial decisions.
- Demand quality: public task inventory includes some sold-out or low-value tasks; active advertiser density needs logged-in verification.

## Next Product Research Steps

- Test creator task acceptance, submission, review, and settlement.
- Test advertiser task creation, deposit handling, refund behavior, and analytics.
- Compare product workflow with creator task marketplaces and scheduler products.
- Recheck pricing, credits, and paid plan capabilities after the next release.

## Sources

- AiToEarn China site: https://aitoearn.cn/zh-CN, accessed 2026-05-11.
- AiToEarn international site: https://aitoearn.ai/en, accessed 2026-05-11.
- What is Aitoearn: https://docs.aitoearn.ai/en/help-center/getting-started/4-what-is-aitoearn, accessed 2026-05-11.
- Pricing: https://docs.aitoearn.ai/en/help-center/pricing/pricing, accessed 2026-05-11.
- Credits pricing: https://docs.aitoearn.ai/en/help-center/pricing/credits-price, accessed 2026-05-11.
