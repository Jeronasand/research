(function () {
  const searchInput = document.getElementById('globalSearch');
  const sections = Array.from(document.querySelectorAll('.searchable'));
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const backTop = document.getElementById('backTop');
  const chips = Array.from(document.querySelectorAll('.chip'));
  const apiRows = Array.from(document.querySelectorAll('#apiTable tbody tr'));

  function normalize(value) {
    return (value || '').toLowerCase().trim();
  }

  function applySearch() {
    const keyword = normalize(searchInput.value);
    sections.forEach(section => {
      const text = normalize(section.textContent);
      section.classList.toggle('hidden-by-search', Boolean(keyword) && !text.includes(keyword));
    });
  }

  function setActiveToc() {
    const offsets = tocLinks
      .map(link => {
        const id = link.getAttribute('href');
        if (!id || !id.startsWith('#')) return null;
        const target = document.querySelector(id);
        if (!target) return null;
        return { link, top: target.getBoundingClientRect().top };
      })
      .filter(Boolean)
      .filter(item => item.top <= 120)
      .sort((a, b) => b.top - a.top);

    tocLinks.forEach(link => link.classList.remove('active'));
    if (offsets[0]) offsets[0].link.classList.add('active');
  }

  function bindCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(block => {
      const title = block.querySelector('.code-title');
      const code = block.querySelector('code');
      if (!title || !code) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '复制';
      title.appendChild(button);

      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          button.textContent = '已复制';
          setTimeout(() => { button.textContent = '复制'; }, 1200);
        } catch (error) {
          button.textContent = '复制失败';
          setTimeout(() => { button.textContent = '复制'; }, 1200);
        }
      });
    });
  }

  function bindApiFilter() {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;
        chips.forEach(item => item.classList.remove('active'));
        chip.classList.add('active');
        apiRows.forEach(row => {
          const match = filter === 'all' || row.dataset.category === filter;
          row.classList.toggle('hidden-row', !match);
        });
      });
    });
  }

  searchInput?.addEventListener('input', applySearch);
  window.addEventListener('scroll', setActiveToc, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  bindCopyButtons();
  bindApiFilter();
  setActiveToc();
})();
