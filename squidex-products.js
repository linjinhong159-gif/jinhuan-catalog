(() => {
  const cfg = window.JINHUAN_SQUIDEX || {};
  if (!cfg.enabled) return;

  const localized = (field, locale = 'en') => {
    if (field == null) return '';
    if (typeof field !== 'object' || Array.isArray(field)) return field;
    if (field[locale] != null) return field[locale];
    if (field.iv != null) return field.iv;
    return Object.values(field).find(v => v != null) ?? '';
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function imageList(value) {
    const raw = localized(value, cfg.locale || 'en');
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else if (typeof raw === 'string') list = raw.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
    else if (raw) list = [String(raw)];

    return list.map(path => {
      if (/^https?:\/\//i.test(path)) return path;
      const clean = path.replace(/^\/+/, '');
      return `${cfg.imageBase || '/assets/products/'}${clean}`;
    });
  }

  function addStyles() {
    if (document.getElementById('sq-product-styles')) return;
    const style = document.createElement('style');
    style.id = 'sq-product-styles';
    style.textContent = `
      .sq-product-image{aspect-ratio:3/4;background:linear-gradient(145deg,#ebe5dc,#d7cdc1);overflow:hidden;display:grid;place-items:center;color:#9b9185;font-size:12px}
      .sq-product-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}.sq-card{cursor:pointer}.sq-card:hover .sq-product-image img{transform:scale(1.025)}
      .sq-product-meta{margin-top:7px;color:var(--muted);font-size:11px}.sq-product-desc{margin-top:9px;color:var(--muted);font-size:12px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .sq-loading,.sq-empty,.sq-error{grid-column:1/-1;padding:40px;border:1px dashed var(--line);background:var(--paper);color:var(--muted);text-align:center}
      .sq-modal{border:0;padding:0;max-width:min(1100px,94vw);width:100%;background:var(--paper);color:var(--ink);box-shadow:0 30px 90px rgba(0,0,0,.25)}.sq-modal::backdrop{background:rgba(20,18,16,.62)}
      .sq-modal-wrap{display:grid;grid-template-columns:1.15fr .85fr;min-height:620px}.sq-gallery{background:#eee7de;padding:24px}.sq-main-image{aspect-ratio:3/4;background:#ddd2c6;display:grid;place-items:center;overflow:hidden}.sq-main-image img{width:100%;height:100%;object-fit:contain}.sq-thumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}.sq-thumb{aspect-ratio:1;background:#fff;border:1px solid var(--line);padding:0;cursor:pointer;overflow:hidden}.sq-thumb img{width:100%;height:100%;object-fit:cover}.sq-info{padding:55px 44px;position:relative}.sq-close{position:absolute;right:18px;top:14px;border:0;background:transparent;font-size:28px;cursor:pointer}.sq-info h2{font-family:Georgia,serif;font-weight:400;font-size:42px;line-height:1.08;margin:8px 0 24px}.sq-specs{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);margin:26px 0}.sq-spec{padding:14px 0;border-bottom:1px solid var(--line)}.sq-spec b{display:block;font-size:10px;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}.sq-spec span{font-size:13px}.sq-full-desc{color:var(--muted);line-height:1.8}.sq-inquiry{display:inline-block;margin-top:26px;background:var(--dark);color:#fff;padding:14px 20px;font-size:12px}
      @media(max-width:800px){.sq-modal-wrap{grid-template-columns:1fr}.sq-info{padding:35px 24px}.sq-gallery{padding:12px}.sq-info h2{font-size:34px}.sq-thumbs{grid-template-columns:repeat(4,1fr)}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    let modal = document.getElementById('sqProductModal');
    if (modal) return modal;
    modal = document.createElement('dialog');
    modal.id = 'sqProductModal';
    modal.className = 'sq-modal';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
    return modal;
  }

  function openProduct(product) {
    const modal = ensureModal();
    const images = product.images.length ? product.images : [''];
    modal.innerHTML = `<div class="sq-modal-wrap">
      <div class="sq-gallery"><div class="sq-main-image">${images[0] ? `<img id="sqMainProductImage" src="${esc(images[0])}" alt="${esc(product.name)}">` : 'PRODUCT IMAGE'}</div>${images.length > 1 ? `<div class="sq-thumbs">${images.map((src,i)=>`<button class="sq-thumb" data-src="${esc(src)}"><img src="${esc(src)}" alt="${esc(product.name)} ${i+1}"></button>`).join('')}</div>` : ''}</div>
      <div class="sq-info"><button class="sq-close" aria-label="Close">×</button><p class="eyebrow">${esc(product.category || 'PRODUCT')}</p><h2>${esc(product.name)}</h2><div class="sq-specs">
        ${product.sku ? `<div class="sq-spec"><b>SKU</b><span>${esc(product.sku)}</span></div>` : ''}
        ${product.size ? `<div class="sq-spec"><b>Size</b><span>${esc(product.size)}</span></div>` : ''}
        ${product.material ? `<div class="sq-spec"><b>Material</b><span>${esc(product.material)}</span></div>` : ''}
        ${product.color ? `<div class="sq-spec"><b>Color</b><span>${esc(product.color)}</span></div>` : ''}
      </div>${product.description ? `<div class="sq-full-desc">${esc(product.description).replace(/\n/g,'<br>')}</div>` : ''}<a class="sq-inquiry" href="#contact" onclick="document.getElementById('sqProductModal').close()">CONTACT FOR DETAILS</a></div>
    </div>`;
    modal.querySelector('.sq-close').onclick = () => modal.close();
    modal.querySelectorAll('.sq-thumb').forEach(btn => btn.onclick = () => { const img = modal.querySelector('#sqMainProductImage'); if (img) img.src = btn.dataset.src; });
    modal.showModal();
  }

  async function loadProducts() {
    addStyles();
    const grid = document.querySelector('#collection .placeholder-grid');
    const title = document.getElementById('collectionTitle');
    if (!grid || !cfg.appName) return;

    grid.innerHTML = '<div class="sq-loading">Loading products…</div>';
    const schema = cfg.productsSchema || cfg.schema || 'products';
    const endpoint = `https://cloud.squidex.io/api/content/${encodeURIComponent(cfg.appName)}/${encodeURIComponent(schema)}?take=100`;

    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Squidex ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];

      if (!items.length) {
        grid.innerHTML = '<div class="sq-empty">No published products yet.</div>';
        if (title) title.textContent = 'Products will appear here after you publish them in Squidex.';
        return;
      }

      const locale = cfg.locale || 'en';
      const products = items.map(item => {
        const d = item.data || {};
        return {
          name: localized(d.name, locale) || 'Untitled product',
          sku: localized(d.sku, locale), category: localized(d.category, locale), size: localized(d.size, locale),
          material: localized(d.material, locale), color: localized(d.color, locale), description: localized(d.description, locale),
          images: imageList(d.imageUrls || d.images || d.image || d.cover)
        };
      });

      grid.innerHTML = products.map((p, index) => {
        const image = p.images[0] || '';
        const meta = [p.sku, p.size, p.material, p.color].filter(Boolean).map(esc).join(' · ');
        return `<article class="card sq-card" data-product-index="${index}"><div class="sq-product-image">${image ? `<img src="${esc(image)}" alt="${esc(p.name)}" loading="lazy">` : 'PRODUCT IMAGE'}</div><div class="cardcopy"><strong>${esc(p.name)}</strong>${meta ? `<div class="sq-product-meta">${meta}</div>` : ''}${p.description ? `<div class="sq-product-desc">${esc(p.description)}</div>` : ''}</div></article>`;
      }).join('');
      grid.querySelectorAll('.sq-card').forEach(card => card.onclick = () => openProduct(products[Number(card.dataset.productIndex)]));
      if (title) title.textContent = `${products.length} products`;
    } catch (error) {
      console.error(error);
      grid.innerHTML = '<div class="sq-error">商品后台已经连接，但前台暂时无法读取。请检查 products Schema 和匿名 Reader 权限。</div>';
    }
  }

  window.addEventListener('DOMContentLoaded', loadProducts);
})();
