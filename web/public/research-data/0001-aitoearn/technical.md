# AiToEarn Technical Research

Current version: v0.2.0
Status: active
Last updated: 2026-05-11

中文版本: `technical.zh-CN.md`

## Scope

This file covers AiToEarn's public technical signals, deployment model, integration surface, release alignment, operational health, and technical risks. Product positioning and business mechanics live in `product.md`.

## Technical And Deployment Signals

Public evidence shows:

- GitHub repository: `yikart/AiToEarn`
- License: MIT
- main implementation language signal on GitHub: TypeScript-dominant repository
- Docker Compose self-hosting path
- source-development path with backend services and web frontend
- separate Electron desktop client reference
- MCP endpoint: `https://aitoearn.ai/api/unified/mcp`
- SSE endpoint: `https://aitoearn.ai/api/unified/sse`
- OpenClaw plugin flow
- API-key based access for OpenClaw, MCP, and relay/self-hosting flows

Self-hosting still depends on careful OAuth/channel configuration. The README recommends using an official relay configuration to avoid registering separate developer credentials for social platforms.

## Integration Surface

The public documentation points to three integration patterns:

- direct SaaS usage through AiToEarn web properties;
- self-hosted deployment through Docker Compose or source development;
- agent/plugin access through OpenClaw, MCP, and SSE endpoints.

The MCP/SSE surface is important because it suggests AiToEarn can be used as an AI-agent tool provider, not only as a standalone web app.

## Release And Documentation Alignment

Documentation and release channels are not fully aligned:

- the official help changelog shows v2.4.0 on 2026-04-29;
- the GitHub repository release panel observed through the public page showed v2.1.0 as latest on 2026-03-28;
- some documentation entry pages appear generic or template-like.

This may mean docs, SaaS, desktop/client, and GitHub releases follow different channels. It should be verified before depending on a specific version.

## Operational Signals

The official status page's current public view showed active issues and very low displayed uptime for multiple products. Treat SaaS reliability as an open technical risk until direct runtime checks and status history are verified.

## Technical Risks And Open Questions

- Platform policy exposure: automated posting and engagement can conflict with social-platform terms, anti-spam rules, and account-risk systems.
- OAuth/channel configuration: each social platform may require distinct credentials, review flows, and rate-limit handling.
- Environment split: China and international environments require matching API keys, which creates integration and support risk.
- Documentation drift: setup, release, and runtime docs may not describe the same deployed version.
- MCP authorization: API-key handling, tool permissions, and data boundaries need direct testing.
- Observability: task processing, social publish failures, and settlement-related actions need auditable logs.

## Next Technical Research Steps

- Inspect the GitHub repository architecture, deployment files, license, and issue history.
- Verify MCP tool capabilities through the OpenAPI/MCP endpoints.
- Run or inspect the Docker Compose self-hosting path.
- Validate OAuth/channel setup requirements for each supported social platform.
- Recheck status page history and live endpoint availability.

## Sources

- GitHub repository: https://github.com/yikart/AiToEarn, accessed 2026-05-11.
- Official docs index: https://docs.aitoearn.ai/llms.txt, accessed 2026-05-11.
- Publishing guide: https://docs.aitoearn.ai/en/help-center/getting-started/3-getting-started-with-aitoearn-publishing-features, accessed 2026-05-11.
- Engagement guide: https://docs.aitoearn.ai/en/help-center/getting-started/8-getting-started-with-aitoearn-engagement-features, accessed 2026-05-11.
- Analytics guide: https://docs.aitoearn.ai/en/help-center/getting-started/7-getting-started-with-aitoearn-analytics-features, accessed 2026-05-11.
- Changelog: https://docs.aitoearn.ai/en/changelog/changelog, accessed 2026-05-11.
- Status page: https://status.aitoearn.ai/, accessed 2026-05-11.
