(() => {
  const cfg = window.JINHUAN_SQUIDEX || {};
  if (!cfg.enabled) return;

  const getLocalized = (field, locale = 'en') => {
    if (field == null) return '';
    if (typeof field !== 'object') return field;
    if (field[locale] != null) return field[locale];
    if (field.iv != null) return field.iv;
    const first = Object.values(field).find(v => v != null);
    return first ?? '';
  };

  const firstAssetId = value => {
    const v = getLocalized(value, cfg.locale || 'en');
    if (Array.isArray(v)) return v[0] || '';
    return v || '';
  };

  const assetUrl = id => id && cfg.appName
    ? `https://contents.squidex.io/${encodeURIComponent(cfg.appName)}/${encodeURIComponent(id)}`
    : '';

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function ensureStyles() {
    if (document.getElementById('sq-product-styles')) return;
    const style = document.createElement('style');
    style.id = 'sq-product-styles';
    style.textContent = `
      .sq-product-image{aspect-ratio:3/4;background:linear-gradient(145deg,#ebe5dc,#d7cdc1);overflow:hidden;display:grid;place-items:center;color:#9b9185;font-size:12px}
      .sq-product-image img{width:100%;height:100%;object-fit:cover;display:block}
      .sq-product-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;color:var(--muted);font-size:11px}
      .sq-product-desc{margin-top:9px;color:var(--muted);font-size:12px;line-height:1.55}
      .sq-loading,.sq-empty,.sq-error{grid-column:1/-1;padding:40px;border:1px dashed var(--line);background:var(--paper);color:var(--muted);text-align:center}
    `;
    document.head.appendChild(style);
  }

  async function loadProducts() {
    ensureStyles();
    const grid = document.querySelector('#collection .placeholder-grid');
    const title = document.getElementById('collectionTitle');
    if (!grid) return;

    if (!cfg.appName) {
      grid.innerHTML = '<div class="sq-empty">Squidex 尚未连接。创建 Squidex App 后，这里会自动显示你已发布的商品。</div>';
      if (title) title.textContent = 'Products are managed in Squidex.';
      return;
    }

    grid.innerHTML = '<div class="sq-loading">Loading products…</div>';

    const endpoint = `https://cloud.squidex.io/api/content/${encodeURIComponent(cfg.appName)}/${encodeURIComponent(cfg.schema || 'products')}?take=100`;

    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Squidex ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];

      if (!items.length) {
        grid.innerHTML = '<div class="sq-empty">No published products yet.</div>';
        if (title) title.textContent = 'Products will appear after publishing them in Squidex.';
        return;
      }

      const locale = cfg.locale || 'en';
      grid.innerHTML = items.map(item => {
        const data = item.data || {};
        const name = getLocalized(data.name, locale) || 'Untitled product';
        const sku = getLocalized(data.sku, locale);
        const size = getLocalized(data.size, locale);
        const material = getLocalized(data.material, locale);
        const color = getLocalized(data.color, locale);
        const description = getLocalized(data.description, locale);
        const imageId = firstAssetId(data.images || data.image || data.cover);
        const image = assetUrl(imageId);
        const meta = [sku, size, material, color].filter(Boolean).map(escapeHtml).join(' · ');
        return `<article class="card">
          <div class="sq-product-image">${image ? `<img src="${image}" alt="${escapeHtml(name)}" loading="lazy">` : 'PRODUCT IMAGE'}</div>
          <div class="cardcopy">
            <strong>${escapeHtml(name)}</strong>
            ${meta ? `<div class="sq-product-meta">${meta}</div>` : ''}
            ${description ? `<div class="sq-product-desc">${escapeHtml(description)}</div>` : ''}
          </div>
        </article>`;
      }).join('');

      if (title) title.textContent = `${items.length} products`;
    } catch (error) {
      console.error(error);
      grid.innerHTML = '<div class="sq-error">Squidex 已连接，但当前无法读取商品。请检查 App 名称、products Schema，以及匿名 Reader 权限。</div>';
    }
  }

  window.addEventListener('DOMContentLoaded', loadProducts);
})();
