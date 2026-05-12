#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { html: diff2htmlHtml } = require('diff2html');

// ------------------- 参数解析 -------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    repo: '',                  // 空字符串表示自动查找
    output: 'index.html',
    maxCommits: 0,             // 0 = 全部
    view: 'side-by-side',      // 或 line-by-line
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && args[i + 1]) {
      options.repo = args[i + 1]; i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1]; i++;
    } else if (args[i] === '--max' && args[i + 1]) {
      options.maxCommits = parseInt(args[i + 1], 10); i++;
    } else if (args[i] === '--view' && args[i + 1]) {
      options.view = args[i + 1] === 'unified' ? 'line-by-line' : 'side-by-side'; i++;
    }
  }
  return options;
}

// ------------------- 工具函数 -------------------
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 向上查找 .git 目录，返回仓库根路径
function findGitRoot(startDir) {
  let current = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {   // 最多向上查 10 层
    const gitPath = path.join(current, '.git');
    if (fs.existsSync(gitPath)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;  // 已到文件系统根
    current = parent;
  }
  return null;
}

// ------------------- 主流程 -------------------
async function main() {
  const opts = parseArgs();

  // 1. 确定仓库路径
  let repoPath;
  if (opts.repo) {
    repoPath = path.resolve(opts.repo);
    console.log(`📁 使用指定仓库：${repoPath}`);
  } else {
    repoPath = findGitRoot(process.cwd());
    if (!repoPath) {
      console.error('❌ 当前目录及父目录未找到 Git 仓库，请用 --repo 指定路径');
      process.exit(1);
    }
    console.log(`📁 自动检测到仓库：${repoPath}`);
  }

  // 2. 校验是否为有效 Git 仓库
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: repoPath, stdio: 'ignore' });
  } catch {
    console.error(`❌ 指定路径不是 Git 仓库：${repoPath}`);
    process.exit(1);
  }

  // 3. 读取所有提交 hash
  console.log('⏳ 正在读取提交历史...');
  let logCmd = 'git log --all --pretty=format:"%H"';
  if (opts.maxCommits > 0) logCmd += ` -n ${opts.maxCommits}`;

  let hashList;
  try {
    const raw = execSync(logCmd, { encoding: 'utf8', cwd: repoPath });
    hashList = raw.trim().split('\n').filter(Boolean);
  } catch (e) {
    console.error('❌ 执行 git log 失败：', e.message);
    process.exit(1);
  }

  if (hashList.length === 0) {
    const emptyHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Git History Report</title>
<style>body{font-family:sans-serif;padding:20px;color:#555;}</style></head>
<body><h2>提交历史为空</h2><p>仓库中没有提交记录。</p></body></html>`;
    fs.writeFileSync(opts.output, emptyHtml);
    console.log(`✅ 空报告已生成：${path.resolve(opts.output)}`);
    return;
  }

  console.log(`找到 ${hashList.length} 个提交，正在提取 diff...`);

  // 4. 内联 CSS
  const cssPath = require.resolve('diff2html/bundles/css/diff2html.min.css');
  const diffCss = fs.readFileSync(cssPath, 'utf8');

  const commits = [];
  let emptyCount = 0;

  for (let i = 0; i < hashList.length; i++) {
    const hash = hashList[i];
    const infoStr = execSync(`git log -1 --pretty=format:"%an||%ad||%s" ${hash}`, {
      encoding: 'utf8', cwd: repoPath,
    });
    const [author, date, message] = infoStr.split('||');

    let diffHtml = '';
    try {
      const diffText = execSync(`git show ${hash} --format="" --patch`, {
        encoding: 'utf8', cwd: repoPath,
      });
      if (diffText.trim()) {
        diffHtml = diff2htmlHtml(diffText, {
          outputFormat: opts.view,
          drawFileList: true,
          matching: 'lines',
          diffStyle: 'word',
        });
      } else {
        diffHtml = '<p style="color:#656d76;padding:12px;">（该提交无差异，可能为合并提交）</p>';
        emptyCount++;
      }
    } catch (e) {
      diffHtml = `<p style="color:red;padding:12px;">生成 diff 出错: ${escapeHtml(e.message)}</p>`;
      emptyCount++;
    }

    commits.push({
      id: hash.substring(0, 8),
      fullHash: hash,
      author: escapeHtml(author),
      date: escapeHtml(date),
      message: escapeHtml(message),
      diffHtml,
    });

    if ((i + 1) % 20 === 0 || i === hashList.length - 1) {
      console.log(`  处理进度: ${i + 1}/${hashList.length}  (空差异: ${emptyCount})`);
    }
  }

  // 5. 构建 HTML

  const html = `<!DOCTYPE html>

<html lang="zh-CN">

<head>

  <meta charset="UTF-8" />

  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Git History Report</title>

  <style>

    ${diffCss}

    :root {

      --bg: #f6f6f3;

      --panel: #ffffff;

      --panel-soft: #fafaf8;

      --text: #111111;

      --muted: #6b6b6b;

      --line: #d8d8d2;

      --line-strong: #111111;

      --chip: #f1f1ed;

      --shadow: 0 16px 40px rgba(0, 0, 0, 0.06);

      --radius: 18px;

    }

    * {

      box-sizing: border-box;

    }

    html {

      scroll-behavior: smooth;

    }

    body {

      margin: 0;

      background:

        linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),

        linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px),

        var(--bg);

      background-size: 28px 28px;

      color: var(--text);

      font-family:

        -apple-system,

        BlinkMacSystemFont,

        "Segoe UI",

        Roboto,

        Helvetica,

        Arial,

        "PingFang SC",

        "Microsoft YaHei",

        sans-serif;

    }

    .app-shell {

      width: min(1520px, calc(100% - 40px));

      margin: 0 auto;

      padding: 28px 0 48px;

    }

    .hero {

      position: sticky;

      top: 0;

      z-index: 100;

      padding: 18px 0 20px;

      background: rgba(246, 246, 243, 0.92);

      backdrop-filter: blur(18px);

      border-bottom: 1px solid var(--line);

    }

    .hero-inner {

      width: min(1520px, calc(100% - 40px));

      margin: 0 auto;

      display: grid;

      grid-template-columns: 1fr auto;

      gap: 18px;

      align-items: center;

    }

    .title-block {

      display: flex;

      flex-direction: column;

      gap: 6px;

    }

    .eyebrow {

      font-size: 12px;

      letter-spacing: 0.16em;

      text-transform: uppercase;

      color: var(--muted);

    }

    h1 {

      margin: 0;

      font-size: clamp(26px, 3vw, 42px);

      line-height: 1.05;

      letter-spacing: -0.04em;

      font-weight: 760;

    }

    .subtitle {

      margin: 0;

      font-size: 13px;

      color: var(--muted);

      max-width: 760px;

      line-height: 1.7;

      word-break: break-all;

    }

    .toolbar {

      display: flex;

      gap: 10px;

      align-items: center;

      flex-wrap: wrap;

      justify-content: flex-end;

    }

    .search-wrap {

      position: relative;

    }

    #searchInput {

      width: min(360px, 72vw);

      height: 42px;

      padding: 0 14px 0 38px;

      border: 1px solid var(--line-strong);

      border-radius: 999px;

      background: var(--panel);

      color: var(--text);

      outline: none;

      font-size: 14px;

      box-shadow: 4px 4px 0 #111;

    }

    #searchInput:focus {

      transform: translate(-1px, -1px);

      box-shadow: 5px 5px 0 #111;

    }

    .search-icon {

      position: absolute;

      left: 15px;

      top: 50%;

      transform: translateY(-50%);

      color: var(--muted);

      font-size: 14px;

      pointer-events: none;

    }

    .action-btn {

      height: 42px;

      padding: 0 14px;

      border: 1px solid var(--line-strong);

      border-radius: 999px;

      background: var(--panel);

      color: var(--text);

      cursor: pointer;

      font-size: 13px;

      font-weight: 650;

      box-shadow: 4px 4px 0 #111;

      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;

    }

    .action-btn:hover {

      transform: translate(-1px, -1px);

      box-shadow: 5px 5px 0 #111;

      background: #fdfdfb;

    }

    .stats {

      display: grid;

      grid-template-columns: repeat(4, minmax(120px, 1fr));

      gap: 12px;

      margin: 24px 0;

    }

    .stat-card {

      background: var(--panel);

      border: 1px solid var(--line-strong);

      border-radius: var(--radius);

      padding: 16px;

      box-shadow: 6px 6px 0 #111;

    }

    .stat-label {

      font-size: 12px;

      color: var(--muted);

      margin-bottom: 8px;

    }

    .stat-value {

      font-size: 24px;

      font-weight: 760;

      letter-spacing: -0.03em;

    }

    .commit-list {

      display: flex;

      flex-direction: column;

      gap: 14px;

    }

    .commit-card {

      background: var(--panel);

      border: 1px solid var(--line-strong);

      border-radius: var(--radius);

      box-shadow: var(--shadow);

      overflow: hidden;

    }

    .commit-header {

      width: 100%;

      border: 0;

      background: transparent;

      color: inherit;

      padding: 0;

      cursor: pointer;

      text-align: left;

    }

    .commit-head-inner {

      display: grid;

      grid-template-columns: auto 1fr auto;

      gap: 14px;

      align-items: center;

      padding: 16px 18px;

      border-bottom: 1px solid transparent;

      transition: background 140ms ease;

    }

    .commit-header:hover .commit-head-inner {

      background: var(--panel-soft);

    }

    .commit-card.open .commit-head-inner {

      border-bottom-color: var(--line);

      background: #fbfbf8;

    }

    .commit-id {

      display: inline-flex;

      align-items: center;

      height: 28px;

      padding: 0 10px;

      border: 1px solid var(--line-strong);

      border-radius: 999px;

      background: var(--chip);

      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

      font-size: 12px;

      font-weight: 700;

      white-space: nowrap;

    }

    .commit-main {

      min-width: 0;

    }

    .commit-message {

      font-size: 15px;

      font-weight: 700;

      line-height: 1.45;

      overflow: hidden;

      text-overflow: ellipsis;

      white-space: nowrap;

    }

    .commit-meta {

      margin-top: 5px;

      font-size: 12px;

      color: var(--muted);

      display: flex;

      gap: 8px;

      flex-wrap: wrap;

      align-items: center;

    }

    .commit-actions {

      display: flex;

      gap: 8px;

      align-items: center;

    }

    .mini-btn {

      border: 1px solid var(--line);

      background: #fff;

      color: var(--text);

      border-radius: 999px;

      height: 30px;

      padding: 0 10px;

      font-size: 12px;

      cursor: pointer;

      white-space: nowrap;

    }

    .mini-btn:hover {

      border-color: var(--line-strong);

      background: #f5f5f2;

    }

    .chevron {

      width: 30px;

      height: 30px;

      border: 1px solid var(--line);

      border-radius: 999px;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      font-size: 14px;

      transition: transform 160ms ease;

    }

    .commit-card.open .chevron {

      transform: rotate(90deg);

      border-color: var(--line-strong);

    }

    .commit-diff {

      display: none;

      padding: 14px;

      background: #fff;

    }

    .commit-card.open .commit-diff {

      display: block;

    }

    .empty-state,

    .no-results {

      border: 1px dashed var(--line-strong);

      border-radius: var(--radius);

      background: rgba(255,255,255,0.7);

      padding: 48px 24px;

      text-align: center;

      color: var(--muted);

    }

    .copy-toast {

      position: fixed;

      right: 24px;

      bottom: 24px;

      z-index: 200;

      padding: 10px 14px;

      border: 1px solid var(--line-strong);

      border-radius: 999px;

      background: #111;

      color: #fff;

      font-size: 13px;

      opacity: 0;

      transform: translateY(8px);

      pointer-events: none;

      transition: opacity 160ms ease, transform 160ms ease;

    }

    .copy-toast.show {

      opacity: 1;

      transform: translateY(0);

    }

    /* diff2html 美化覆盖 */

    .d2h-wrapper {

      color: var(--text);

      font-size: 13px;

    }

    .d2h-file-wrapper {

      border: 1px solid var(--line);

      border-radius: 14px;

      overflow: hidden;

      margin-bottom: 14px;

    }

    .d2h-file-header {

      background: #f7f7f4;

      border-bottom: 1px solid var(--line);

      padding: 10px 12px;

      font-weight: 700;

    }

    .d2h-file-name {

      color: var(--text);

    }

    .d2h-diff-table {

      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

      font-size: 12px;

    }

    .d2h-code-line,

    .d2h-code-side-line {

      padding: 0 10px;

    }

    .d2h-code-linenumber,

    .d2h-code-side-linenumber {

      background: #fafaf8;

      color: #8a8a8a;

      border-color: #eeeeea;

    }

    .d2h-del {

      background-color: #fff1f0;

    }

    .d2h-ins {

      background-color: #effff1;

    }

    .d2h-info {

      background-color: #f4f4f0;

      color: #777;

    }

    .d2h-file-list-wrapper {

      border: 1px solid var(--line);

      border-radius: 14px;

      margin-bottom: 14px;

      overflow: hidden;

    }

    .d2h-file-list-header {

      background: #f7f7f4;

      border-bottom: 1px solid var(--line);

    }

    .d2h-file-list-title {

      font-weight: 750;

    }

    @media (max-width: 900px) {

      .hero-inner {

        grid-template-columns: 1fr;

      }

      .toolbar {

        justify-content: flex-start;

      }

      .stats {

        grid-template-columns: repeat(2, 1fr);

      }

      .commit-head-inner {

        grid-template-columns: 1fr;

      }

      .commit-actions {

        justify-content: space-between;

      }

      .commit-message {

        white-space: normal;

      }

    }

    @media (max-width: 560px) {

      .app-shell,

      .hero-inner {

        width: min(100% - 24px, 1520px);

      }

      .stats {

        grid-template-columns: 1fr;

      }

      #searchInput {

        width: 100%;

      }

      .search-wrap {

        width: 100%;

      }

      .action-btn {

        flex: 1;

      }

    }

  </style>

</head>

<body>

  <header class="hero">

    <div class="hero-inner">

      <div class="title-block">

        <div class="eyebrow">Git History Diff Report</div>

        <h1>提交历史差异报告</h1>

        <p class="subtitle">

          仓库：${escapeHtml(repoPath)} · 视图：${escapeHtml(opts.view)} · 支持按提交信息、作者、Hash 搜索

        </p>

      </div>

      <div class="toolbar">

        <div class="search-wrap">

          <span class="search-icon">⌕</span>

          <input type="text" id="searchInput" placeholder="搜索提交信息 / 作者 / Hash" />

        </div>

        <button class="action-btn" id="expandAllBtn" type="button">展开全部</button>

        <button class="action-btn" id="collapseAllBtn" type="button">收起全部</button>

      </div>

    </div>

  </header>

  <main class="app-shell">

    <section class="stats">

      <div class="stat-card">

        <div class="stat-label">提交总数</div>

        <div class="stat-value">${commits.length}</div>

      </div>

      <div class="stat-card">

        <div class="stat-label">空差异提交</div>

        <div class="stat-value">${emptyCount}</div>

      </div>

      <div class="stat-card">

        <div class="stat-label">当前显示</div>

        <div class="stat-value" id="visibleCount">${commits.length}</div>

      </div>

      <div class="stat-card">

        <div class="stat-label">最大读取</div>

        <div class="stat-value">${opts.maxCommits > 0 ? opts.maxCommits : 'ALL'}</div>

      </div>

    </section>

    <section class="commit-list" id="commitList"></section>

  </main>

  <div class="copy-toast" id="copyToast">已复制完整 Hash</div>

  <script>

    const commitsData = ${JSON.stringify(commits)};

    function showToast(text) {

      const toast = document.getElementById('copyToast');

      toast.textContent = text || '已复制';

      toast.classList.add('show');

      window.clearTimeout(window.__copyToastTimer);

      window.__copyToastTimer = window.setTimeout(() => {

        toast.classList.remove('show');

      }, 1300);

    }

    function copyText(text) {

      if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(text).then(() => showToast('已复制完整 Hash'));

        return;

      }

      const textarea = document.createElement('textarea');

      textarea.value = text;

      textarea.style.position = 'fixed';

      textarea.style.opacity = '0';

      document.body.appendChild(textarea);

      textarea.select();

      document.execCommand('copy');

      textarea.remove();

      showToast('已复制完整 Hash');

    }

    function renderCommitList(filterText = '') {

      const container = document.getElementById('commitList');

      const visibleCount = document.getElementById('visibleCount');

      if (!container) return;

      const lowerFilter = filterText.trim().toLowerCase();

      const filtered = commitsData.filter(c =>

        c.message.toLowerCase().includes(lowerFilter) ||

        c.author.toLowerCase().includes(lowerFilter) ||

        c.id.toLowerCase().includes(lowerFilter) ||

        c.fullHash.toLowerCase().includes(lowerFilter)

      );

      visibleCount.textContent = filtered.length;

      if (filtered.length === 0) {

        container.innerHTML = '<div class="no-results">没有找到匹配的提交</div>';

        return;

      }

      container.innerHTML = filtered.map((commit, index) => {

        const diffId = 'diff-' + commit.id + '-' + index;

        return (

          '<article class="commit-card">' +

            '<button class="commit-header" type="button" data-target="' + diffId + '">' +

              '<div class="commit-head-inner">' +

                '<span class="commit-id">' + commit.id + '</span>' +

                '<div class="commit-main">' +

                  '<div class="commit-message">' + commit.message + '</div>' +

                  '<div class="commit-meta">' +

                    '<span>' + commit.author + '</span>' +

                    '<span>·</span>' +

                    '<span>' + commit.date + '</span>' +

                  '</div>' +

                '</div>' +

                '<div class="commit-actions">' +

                  '<span class="mini-btn copy-hash" data-hash="' + commit.fullHash + '">复制 Hash</span>' +

                  '<span class="chevron">›</span>' +

                '</div>' +

              '</div>' +

            '</button>' +

            '<div class="commit-diff" id="' + diffId + '">' +

              commit.diffHtml +

            '</div>' +

          '</article>'

        );

      }).join('');

    }

    function setAll(open) {

      document.querySelectorAll('.commit-card').forEach(card => {

        card.classList.toggle('open', open);

      });

    }

    document.addEventListener('DOMContentLoaded', () => {

      const input = document.getElementById('searchInput');

      const container = document.getElementById('commitList');

      renderCommitList();

      input.addEventListener('input', e => {

        renderCommitList(e.target.value);

      });

      container.addEventListener('click', e => {

        const copyBtn = e.target.closest('.copy-hash');

        if (copyBtn) {

          e.preventDefault();

          e.stopPropagation();

          copyText(copyBtn.dataset.hash);

          return;

        }

        const header = e.target.closest('.commit-header');

        if (!header) return;

        const card = header.closest('.commit-card');

        if (card) {

          card.classList.toggle('open');

        }

      });

      document.getElementById('expandAllBtn').addEventListener('click', () => setAll(true));

      document.getElementById('collapseAllBtn').addEventListener('click', () => setAll(false));

    });

  </script>

</body>

</html>`;

  fs.writeFileSync(opts.output, html, 'utf8');
  console.log(`✅ 报告已生成：${path.resolve(opts.output)}`);
  console.log(`   包含 ${commits.length} 个提交，文件大小 ${(fs.statSync(opts.output).size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('❌ 生成失败:', err.message);
  process.exit(1);
});