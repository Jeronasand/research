# Research

私有调研资料库，按三种状态保存已整理好的 Web 静态包，并通过 OSS 双桶预览。

## 目录

```text
preview/
  login.html
  index.html
research/
  待调研/
    <项目名>/index.html
  调研中/
    <项目名>/index.html
    <项目组>/
      <项目名>/index.html
  调研完成/
    <项目名>/index.html
upload.js
tree.json
```

每个项目目录都是一个完整静态站点，入口文件固定为 `index.html`。状态目录下面可以继续放分组目录；没有 `index.html` 的目录会作为分组或占位目录展示，继续向下索引。项目内可以继续包含子目录，例如 `split/index.html`、`assets/`、`data/`；包内相对 HTML 链接、CSS、图片、字体和 `fetch/XHR` 数据会在预览页内重新签名加载。

## 一键部署

```bash
npm run deploy
```

这条命令会：

1. 根据 `research/待调研`、`research/调研中`、`research/调研完成` 生成 `tree.json`。
2. 清空 datas 私有桶中的对象，但不删除桶。
3. 上传 `research/` 和 `tree.json` 到 datas 桶。
4. 上传 `preview/login.html` 和 `preview/index.html` 到 preview 桶，并清理 preview 桶旧对象。
5. 验证 `tree.json`、首个项目入口、`login.html` 和 `index.html`。

预览执行范围：

```bash
npm run deploy:dry-run
```

只更新 datas 私有数据桶，不更新 preview 桶：

```bash
./update-research-data.sh
```

如果改了 `preview/`、`upload.js`、`tree.json` 结构或索引规则，先运行一次 `npm run deploy` 更新 preview 桶；之后只改 `research/` 内容时再用上面的 datas 更新脚本。

等价 npm 命令：

```bash
npm run update:datas
```

只生成本地 `tree.json`：

```bash
npm run tree
```

校验 `tree.json` 与真实目录是否一致：

```bash
npm run tree:check
```

不写入文件，只打印从 `research/` 生成的目录树：

```bash
npm run tree:print
```

## 默认 OSS 配置

- preview 桶：`research-preview`
- datas 桶：`research-pages`
- endpoint：`oss-cn-shenzhen.aliyuncs.com`
- region：`cn-shenzhen`

可用环境变量覆盖：

```bash
PREVIEW_BUCKET=research-preview \
DATAS_BUCKET=research-pages \
OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com \
OSS_REGION=cn-shenzhen \
npm run deploy
```

## 前端访问

1. 打开 preview 桶静态页面。
2. 在 `login.html` 输入可读取 datas 桶的 AK/SK、region 和 bucket。
3. 登录页验证能读取 `tree.json` 后进入 `index.html`。
4. 主页读取 datas 桶的 `tree.json`，按三大板块渲染项目卡片。
5. 点击项目后全屏 iframe 预览对应 `research/<状态>/<项目>/index.html`，包内子目录页面通过相对链接继续预览。

## 安全边界

当前方案是纯前端 AK/SK 访问，只适合内部或个人验证环境。生产环境应改为后端签名代理或 STS 临时授权。
