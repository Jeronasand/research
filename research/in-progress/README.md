# 调研中

每个直接子目录都是一个正在产出的 Web 静态调研包。

```text
research/in-progress/<research-id>/
  index.html
  assets/
  data/
  research.json   # optional metadata
```

前端只索引直接子目录的 `index.html`，不会展开包内所有 HTML 文件。
