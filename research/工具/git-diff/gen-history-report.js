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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git History Report</title>
  <style>
    ${diffCss}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f0f2f5;
      color: #24292e;
    }
    .header {
      background: white;
      padding: 16px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header h1 { font-size: 1.3rem; margin: 0; }
    #searchInput {
      padding: 6px 12px;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      width: 220px;
      font-size: 0.9rem;
      margin-left: auto;
    }
    .commit-list {
      margin: 24px;
      max-width: 1400px;
    }
    .commit-item {
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .commit-header {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 16px;
      border-bottom: 1px solid #eaecef;
    }
    .commit-header:hover { background: #f6f8fa; }
    .commit-id {
      font-family: monospace;
      font-weight: 600;
      color: #0550ae;
      background: #ddf4ff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .commit-message {
      font-weight: 600;
      flex: 1;
      min-width: 200px;
    }
    .commit-meta {
      font-size: 0.82rem;
      color: #656d76;
      white-space: nowrap;
    }
    .commit-diff {
      display: none;
      padding: 0;
    }
    .commit-diff.open {
      display: block;
    }
    .no-results {
      text-align: center;
      padding: 40px;
      color: #656d76;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📜 提交历史差异报告</h1>
    <input type="text" id="searchInput" placeholder="搜索提交信息或作者..." />
  </div>
  <div class="commit-list" id="commitList"></div>

  <script>
    const commitsData = ${JSON.stringify(commits)};

    function renderCommitList(filterText = '') {
      const container = document.getElementById('commitList');
      if (!container) return;
      const lowerFilter = filterText.toLowerCase();
      const filtered = commitsData.filter(c => 
        c.message.toLowerCase().includes(lowerFilter) ||
        c.author.toLowerCase().includes(lowerFilter) ||
        c.id.includes(lowerFilter)
      );

      if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results">没有找到匹配的提交</div>';
        return;
      }

      container.innerHTML = filtered.map((commit, index) => {
        const diffId = 'diff-' + index;
        return (
          '<div class="commit-item">' +
            '<div class="commit-header" onclick="document.getElementById(\\'' + diffId + '\\').classList.toggle(\\'open\\')">' +
              '<span class="commit-id">' + commit.id + '</span>' +
              '<span class="commit-message">' + commit.message + '</span>' +
              '<span class="commit-meta">' + commit.author + ' · ' + commit.date + '</span>' +
            '</div>' +
            '<div class="commit-diff" id="' + diffId + '">' +
              commit.diffHtml +
            '</div>' +
          '</div>'
        );
      }).join('');
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderCommitList();
      document.getElementById('searchInput').addEventListener('input', (e) => {
        renderCommitList(e.target.value);
      });
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