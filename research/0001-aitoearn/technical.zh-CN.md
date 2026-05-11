# AiToEarn 技术调研

当前版本: v0.2.0
状态: active
最后更新: 2026-05-11

English version: `technical.md`

## 范围

本文覆盖 AiToEarn 的公开技术信号、部署模型、集成面、版本一致性、运维健康度和技术风险。产品定位和商业机制单独维护在 `product.zh-CN.md`。

## 技术与部署信号

公开信息显示：

- GitHub 仓库：`yikart/AiToEarn`
- License：MIT
- GitHub 语言占比显示 TypeScript 为主
- 支持 Docker Compose 自部署
- 支持后端服务和 Web 前端源码开发路径
- 有独立 Electron 桌面客户端说明
- MCP 接入点：`https://aitoearn.ai/api/unified/mcp`
- SSE 接入点：`https://aitoearn.ai/api/unified/sse`
- OpenClaw 插件流程
- OpenClaw、MCP、relay/self-hosting 都依赖 API Key

自部署仍然依赖谨慎配置 OAuth 和渠道授权。README 建议使用官方 relay 配置，以避免为每个社交平台单独申请开发者凭据。

## 集成面

公开文档指向三类集成方式：

- 通过 AiToEarn Web 产品直接使用 SaaS；
- 通过 Docker Compose 或源码开发进行自部署；
- 通过 OpenClaw、MCP 和 SSE 端点接入 agent/plugin 流程。

MCP/SSE 面很关键，因为它说明 AiToEarn 不只是独立 Web 应用，也可能作为 AI Agent 的工具提供方。

## 发布与文档一致性

文档和发布渠道没有完全对齐：

- 官方帮助文档更新日志显示 2026-04-29 的 v2.4.0；
- GitHub 仓库公开页面观察到的 Releases 面板显示 2026-03-28 的 v2.1.0 为 latest；
- 部分文档入口页面看起来仍偏通用或模板化。

这可能意味着 docs、SaaS、桌面端/client 和 GitHub release 使用不同发布通道。依赖某个具体版本前需要验证。

## 运维信号

官方状态页当前公开视图显示存在活跃问题，并展示多个产品的极低 uptime 数值。在做 SaaS 依赖前，应把可用性视为开放技术风险，直到完成直接运行时检查和状态历史核对。

## 技术风险与待确认问题

- 平台政策风险：自动发布和自动互动可能触碰社交平台服务条款、反垃圾规则和账号风控。
- OAuth/渠道配置：不同社交平台可能需要独立凭据、审核流程和限流处理。
- 环境拆分：中国环境和国际环境需要匹配对应 API Key，会带来集成和支持风险。
- 文档漂移：部署、发布和运行时文档可能描述的不是同一线上版本。
- MCP 授权：API Key 处理、工具权限和数据边界需要直接测试。
- 可观测性：任务处理、社媒发布失败和结算相关动作需要可审计日志。

## 下一步技术调研

- 检查 GitHub 仓库架构、部署文件、license 和 issue 历史。
- 通过 OpenAPI/MCP 端点核对实际工具能力。
- 运行或检查 Docker Compose 自部署路径。
- 验证各社交平台 OAuth/渠道配置要求。
- 重新核对状态页历史和实时端点可用性。

## 来源

- GitHub 仓库：https://github.com/yikart/AiToEarn，访问日期 2026-05-11。
- 官方文档索引：https://docs.aitoearn.ai/llms.txt，访问日期 2026-05-11。
- Publishing guide：https://docs.aitoearn.ai/en/help-center/getting-started/3-getting-started-with-aitoearn-publishing-features，访问日期 2026-05-11。
- Engagement guide：https://docs.aitoearn.ai/en/help-center/getting-started/8-getting-started-with-aitoearn-engagement-features，访问日期 2026-05-11。
- Analytics guide：https://docs.aitoearn.ai/en/help-center/getting-started/7-getting-started-with-aitoearn-analytics-features，访问日期 2026-05-11。
- Changelog：https://docs.aitoearn.ai/en/changelog/changelog，访问日期 2026-05-11。
- 状态页：https://status.aitoearn.ai/，访问日期 2026-05-11。
