const endpointExamples = {
  protocols: 'https://api.llama.fi/protocols',
  aave: 'https://api.llama.fi/protocol/aave',
  chains: 'https://api.llama.fi/v2/chains',
  historicalEth: 'https://api.llama.fi/v2/historicalChainTvl/Ethereum',
  usdcPrice: 'https://coins.llama.fi/prices/current/ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  yields: 'https://yields.llama.fi/pools',
  stablecoins: 'https://stablecoins.llama.fi/stablecoins?includePrices=true'
};

const toast = document.getElementById('toast');
const apiOutput = document.getElementById('apiOutput');
const apiUrl = document.getElementById('apiUrl');
const exampleSelect = document.getElementById('exampleSelect');
const runFetchButton = document.getElementById('runFetch');
const clearOutputButton = document.getElementById('clearOutput');
const backTopButton = document.getElementById('backTop');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1700);
}

function truncateJson(data) {
  const text = JSON.stringify(data, null, 2);
  if (text.length <= 12000) return text;
  return `${text.slice(0, 12000)}\n\n... 已截断，仅展示前 12,000 字符`;
}

function addCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return;
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.type = 'button';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      const text = pre.querySelector('code')?.textContent ?? pre.textContent;
      try {
        await navigator.clipboard.writeText(text.replace('复制', '').trim());
        showToast('已复制代码');
      } catch {
        showToast('复制失败，请手动选择');
      }
    });
    pre.appendChild(button);
  });
}

function updateExampleUrl() {
  apiUrl.value = endpointExamples[exampleSelect.value] || endpointExamples.protocols;
}

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${typeof payload === 'string' ? payload.slice(0, 240) : JSON.stringify(payload).slice(0, 240)}`);
    }
    return payload;
  } finally {
    window.clearTimeout(timer);
  }
}

async function runFetchExample() {
  const url = apiUrl.value.trim();
  if (!url) {
    showToast('请填写 API URL');
    return;
  }

  apiOutput.textContent = `请求中：${url}`;
  runFetchButton.disabled = true;
  runFetchButton.textContent = '请求中...';

  try {
    const data = await fetchWithTimeout(url);
    apiOutput.textContent = truncateJson(data);
    showToast('请求完成');
  } catch (error) {
    apiOutput.textContent = [
      '请求失败。',
      '',
      `URL: ${url}`,
      `Error: ${error.message}`,
      '',
      '可能原因：本地网络不可达、浏览器 CORS 限制、接口限流、端点权限不足。生产环境建议用后端代理。'
    ].join('\n');
    showToast('请求失败');
  } finally {
    runFetchButton.disabled = false;
    runFetchButton.textContent = '运行 fetch';
  }
}

function initEndpointFilter() {
  const input = document.getElementById('endpointSearch');
  const rows = [...document.querySelectorAll('#endpointTable tbody tr')];
  input?.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();
    rows.forEach((row) => {
      const haystack = `${row.textContent} ${row.dataset.endpoint || ''}`.toLowerCase();
      row.style.display = haystack.includes(keyword) ? '' : 'none';
    });
  });
}

function initActiveToc() {
  const links = [...document.querySelectorAll('.toc a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-28% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] });

  sections.forEach((section) => observer.observe(section));
}

function initImageModal() {
  document.querySelectorAll('.shot-button').forEach((button) => {
    button.addEventListener('click', () => {
      modalImage.src = button.dataset.img;
      modalTitle.textContent = button.dataset.title || '截图预览';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function initBackTop() {
  window.addEventListener('scroll', () => {
    backTopButton.classList.toggle('show', window.scrollY > 720);
  }, { passive: true });
  backTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initChecklistPersistence() {
  const key = 'defillama-research-checklist';
  const boxes = [...document.querySelectorAll('.checklist-grid input[type="checkbox"]')];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    boxes.forEach((box, index) => {
      box.checked = Boolean(saved[index]);
    });
  } catch {
    // ignore corrupted localStorage
  }

  boxes.forEach((box) => {
    box.addEventListener('change', () => {
      localStorage.setItem(key, JSON.stringify(boxes.map((item) => item.checked)));
    });
  });
}

exampleSelect?.addEventListener('change', updateExampleUrl);
runFetchButton?.addEventListener('click', runFetchExample);
clearOutputButton?.addEventListener('click', () => {
  apiOutput.textContent = '选择示例后点击“运行 fetch”。';
});

updateExampleUrl();
addCopyButtons();
initEndpointFilter();
initActiveToc();
initImageModal();
initBackTop();
initChecklistPersistence();
