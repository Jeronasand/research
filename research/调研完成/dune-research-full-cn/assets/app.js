
function filterCards(){
  const q=(document.getElementById('search')?.value||'').toLowerCase();
  document.querySelectorAll('[data-search]').forEach(el=>{
    const text=el.getAttribute('data-search').toLowerCase();
    el.style.display = text.includes(q) ? '' : 'none';
  });
}
