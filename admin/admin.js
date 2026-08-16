const KEYS = {
  theme: 'jh_simple_theme_v1',
  products: 'jh_products_v2',
  media: 'jh_media_v2',
  settings: 'jh_settings_v2'
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(err);
    alert('浏览器本地存储空间不足。请删除一些大图片后再试。');
    return false;
  }
};

async function imageData(file, maxSide = 1800, quality = 0.88) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) return '';
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d', { alpha: false }).drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const defaults = [
  { id: 'announce', type: 'announcement', enabled: true, text: 'WORLDWIDE PRODUCT CATALOGUE · CONTACT US FOR DETAILS' },
  { id: 'header', type: 'header', enabled: true, logo: 'JINHUAN', menu1: 'Collection', menu2: 'About', menu3: 'Contact' },
  {
    id: 'hero', type: 'hero', enabled: true,
    eyebrow: 'CURATED HANDBAGS',
    title: 'Quiet elegance, made to be carried.',
    text: 'Discover our handbag catalogue. Browse the collection and contact us directly for product details.',
    button: 'VIEW COLLECTION',
    image: '',
    layout: 'text-left'
  },
  {
    id: 'benefits', type: 'benefits', enabled: true,
    title1: 'Worldwide viewing', text1: 'Fast product catalogue',
    title2: 'Detailed products', text2: 'Size · Material · Color · SKU',
    title3: 'Direct inquiry', text3: 'Contact us for any item'
  },
  { id: 'products', type: 'products', enabled: true, eyebrow: 'THE COLLECTION', title: 'Featured products', columns: '3', count: '6' },
  {
    id: 'story', type: 'imageText', enabled: true,
    eyebrow: 'ABOUT JINHUAN',
    title: 'Made for clear product discovery.',
    text: 'Use this area to introduce your business, craftsmanship, service or collection story.',
    image: '',
    position: 'left'
  },
  {
    id: 'contact', type: 'contact', enabled: true,
    eyebrow: 'CONTACT',
    title: 'Interested in a product?',
    text: 'Contact us directly for availability and details.',
    button: 'CONTACT US'
  },
  { id: 'footer', type: 'footer', enabled: true, title: 'JINHUAN', text: '© 2026 JINHUAN · Global Product Catalogue' }
];

const labels = {
  announcement: ['顶部公告', '点击中间文字直接修改'],
  header: ['导航栏', 'Logo 和菜单'],
  hero: ['首屏大图', '主标题 + 图片'],
  benefits: ['三大卖点', '三栏核心优势'],
  products: ['商品区', '自动显示已上架商品'],
  imageText: ['图文介绍', '图片 + 品牌故事'],
  contact: ['联系区', '联系方式与按钮'],
  footer: ['页脚', '网站底部信息']
};

const library = [
  ['hero', '首屏大图', '大标题、说明和主视觉图片'],
  ['products', '商品区', '自动显示已上架商品'],
  ['imageText', '图文介绍', '图片配品牌或系列介绍'],
  ['benefits', '三大卖点', '三栏核心卖点'],
  ['contact', '联系区', '询盘与联系方式'],
  ['announcement', '顶部公告', '顶部一行公告文字']
];

let sections = read(KEYS.theme, defaults);
if (!Array.isArray(sections) || !sections.length) sections = structuredClone(defaults);
let products = read(KEYS.products, []);
if (!Array.isArray(products)) products = [];
let media = read(KEYS.media, []);
if (!Array.isArray(media)) media = [];
let settings = read(KEYS.settings, { brand: 'JINHUAN', language: 'en', email: '', whatsapp: '', telegram: '' });

let selectedId = sections.find(s => s.type === 'hero')?.id || sections[0]?.id || null;
let saveTimer = null;
let previewTimer = null;

function setSaveState(text) {
  const el = $('#saveState');
  if (el) el.textContent = text;
}

function persistTheme({ preview = true } = {}) {
  write(KEYS.theme, sections);
  setSaveState('已保存');
  if (preview) renderPreview();
}

function scheduleThemeSave({ preview = true } = {}) {
  setSaveState('保存中…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persistTheme({ preview }), 220);
}

function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 180);
}

function selectedSection() {
  return sections.find(s => s.id === selectedId) || null;
}

function highlightInFrame(id) {
  const frame = $('#previewFrame');
  if (frame?.contentWindow) frame.contentWindow.postMessage({ type: 'jh-highlight', id }, '*');
}

function renderSectionList() {
  const box = $('#sectionList');
  if (!box) return;
  box.innerHTML = sections.map(s => {
    const [title, sub] = labels[s.type] || [s.type, ''];
    return `<div class="section-row ${s.id === selectedId ? 'active' : ''} ${s.enabled ? '' : 'disabled'}" data-id="${s.id}">
      <span class="drag-handle" title="拖动排序">⋮⋮</span>
      <div class="section-label"><strong>${esc(title)}</strong><small>${esc(sub)}</small></div>
      <button class="visibility" title="显示/隐藏">${s.enabled ? '◉' : '○'}</button>
    </div>`;
  }).join('');

  $$('.section-row', box).forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('.visibility')) return;
      selectedId = row.dataset.id;
      renderSectionList();
      renderEditor();
      highlightInFrame(selectedId);
    });
    const vis = row.querySelector('.visibility');
    vis.onclick = e => {
      e.stopPropagation();
      const s = sections.find(x => x.id === row.dataset.id);
      if (!s) return;
      s.enabled = !s.enabled;
      scheduleThemeSave({ preview: true });
      renderSectionList();
      renderEditor();
    };
  });

  if (window.Sortable) {
    if (box._sortable) box._sortable.destroy();
    box._sortable = new Sortable(box, {
      animation: 160,
      handle: '.drag-handle',
      onEnd: e => {
        const [moved] = sections.splice(e.oldIndex, 1);
        sections.splice(e.newIndex, 0, moved);
        scheduleThemeSave({ preview: true });
        renderSectionList();
      }
    });
  }
}

function field(label, key, value, type = 'text') {
  if (type === 'textarea') return `<label class="field"><span>${label}</span><textarea data-key="${key}" rows="4">${esc(value ?? '')}</textarea></label>`;
  return `<label class="field"><span>${label}</span><input data-key="${key}" type="${type}" value="${esc(value ?? '')}"></label>`;
}

function imageField(s) {
  return `<label class="field"><span>图片</span><div class="image-field">
    <div class="image-preview">${s.image ? `<img src="${s.image}" alt="">` : '还没有图片'}</div>
    <div class="image-actions"><label>上传图片<input class="section-image" type="file" accept="image/*" hidden></label><button type="button" class="choose-media">从素材库选择</button></div>
  </div></label>`;
}

function renderEditor() {
  const s = selectedSection();
  const wrap = $('#sectionEditor');
  const empty = $('#emptyEditor');
  if (!wrap || !empty) return;
  if (!s) { empty.hidden = false; wrap.hidden = true; return; }

  empty.hidden = true;
  wrap.hidden = false;
  const [title] = labels[s.type] || [s.type];
  let body = `<div class="direct-tip"><b>最快修改：</b>直接点击中间预览里的文字，就可以输入。</div>`;

  if (s.type === 'announcement') body += field('公告文字', 'text', s.text);
  if (s.type === 'header') body += field('Logo 文字', 'logo', s.logo) + field('菜单 1', 'menu1', s.menu1) + field('菜单 2', 'menu2', s.menu2) + field('菜单 3', 'menu3', s.menu3);
  if (s.type === 'hero') body += imageField(s) + field('小标题', 'eyebrow', s.eyebrow) + field('主标题', 'title', s.title, 'textarea') + field('说明文字', 'text', s.text, 'textarea') + field('按钮文字', 'button', s.button) + `<label class="field"><span>版式</span><select data-key="layout"><option value="text-left" ${s.layout === 'text-left' ? 'selected' : ''}>文字左 / 图片右</option><option value="text-right" ${s.layout === 'text-right' ? 'selected' : ''}>图片左 / 文字右</option><option value="full" ${s.layout === 'full' ? 'selected' : ''}>整张大图</option></select></label>`;
  if (s.type === 'benefits') body += field('卖点 1 标题', 'title1', s.title1) + field('卖点 1 说明', 'text1', s.text1) + field('卖点 2 标题', 'title2', s.title2) + field('卖点 2 说明', 'text2', s.text2) + field('卖点 3 标题', 'title3', s.title3) + field('卖点 3 说明', 'text3', s.text3);
  if (s.type === 'products') body += field('小标题', 'eyebrow', s.eyebrow) + field('标题', 'title', s.title) + `<div class="inline-2"><label class="field"><span>每行商品</span><select data-key="columns"><option value="2" ${s.columns === '2' ? 'selected' : ''}>2 个</option><option value="3" ${s.columns === '3' ? 'selected' : ''}>3 个</option><option value="4" ${s.columns === '4' ? 'selected' : ''}>4 个</option></select></label><label class="field"><span>显示数量</span><select data-key="count"><option value="4" ${s.count === '4' ? 'selected' : ''}>4 个</option><option value="6" ${s.count === '6' ? 'selected' : ''}>6 个</option><option value="8" ${s.count === '8' ? 'selected' : ''}>8 个</option><option value="12" ${s.count === '12' ? 'selected' : ''}>12 个</option></select></label></div><p class="help">商品内容来自左侧“商品管理”。</p>`;
  if (s.type === 'imageText') body += imageField(s) + field('小标题', 'eyebrow', s.eyebrow) + field('标题', 'title', s.title) + field('介绍文字', 'text', s.text, 'textarea') + `<label class="field"><span>图片位置</span><select data-key="position"><option value="left" ${s.position === 'left' ? 'selected' : ''}>图片左</option><option value="right" ${s.position === 'right' ? 'selected' : ''}>图片右</option></select></label>`;
  if (s.type === 'contact') body += field('小标题', 'eyebrow', s.eyebrow) + field('标题', 'title', s.title) + field('说明', 'text', s.text, 'textarea') + field('按钮文字', 'button', s.button);
  if (s.type === 'footer') body += field('品牌文字', 'title', s.title) + field('版权信息', 'text', s.text);

  wrap.innerHTML = `<div class="editor-head"><h2>${esc(title)}</h2>${['header', 'footer'].includes(s.type) ? '' : '<button class="delete-section">删除模块</button>'}</div><div class="editor-body"><div class="switch-row"><span>显示这个模块</span><input class="toggle enabled-toggle" type="checkbox" ${s.enabled ? 'checked' : ''}></div>${body}</div>`;

  $$('[data-key]', wrap).forEach(el => el.addEventListener('input', () => {
    s[el.dataset.key] = el.value;
    write(KEYS.theme, sections);
    setSaveState('保存中…');
    schedulePreview();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => setSaveState('已保存'), 220);
  }));

  const toggle = $('.enabled-toggle', wrap);
  if (toggle) toggle.onchange = e => { s.enabled = e.target.checked; scheduleThemeSave({ preview: true }); renderSectionList(); };

  const del = $('.delete-section', wrap);
  if (del) del.onclick = () => {
    if (!confirm('确定删除这个模块吗？')) return;
    sections = sections.filter(x => x.id !== s.id);
    selectedId = sections[0]?.id || null;
    persistTheme({ preview: true });
    renderSectionList();
    renderEditor();
  };

  const file = $('.section-image', wrap);
  if (file) file.onchange = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await imageData(f);
    if (!data) return;
    s.image = data;
    media.unshift({ id: uid(), name: f.name, src: data });
    write(KEYS.media, media);
    persistTheme({ preview: true });
    renderEditor();
    renderMedia();
  };

  const choose = $('.choose-media', wrap);
  if (choose) choose.onclick = () => {
    if (!media.length) { alert('图片素材里还没有图片，先上传一张。'); return; }
    const names = media.slice(0, 12).map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const n = Number(prompt(`输入要使用的图片编号：\n${names}`));
    if (n && media[n - 1]) { s.image = media[n - 1].src; persistTheme({ preview: true }); renderEditor(); }
  };
}

function direct(tag, s, key, className = '') {
  return `<${tag} class="direct-edit ${className}" data-jh-section="${s.id}" data-jh-edit="${key}" contenteditable="true" spellcheck="false">${esc(s[key] ?? '')}</${tag}>`;
}

function directAnchor(s, key, className = '') {
  return `<a href="#" class="direct-edit ${className}" data-jh-section="${s.id}" data-jh-edit="${key}" contenteditable="true" spellcheck="false">${esc(s[key] ?? '')}</a>`;
}

function productCards(count = 6, columns = 3) {
  const active = products.filter(p => p.status === 'active').slice(0, Number(count));
  if (!active.length) return `<div class="empty-product">商品会显示在这里<br><small>进入后台“商品管理”新增商品</small></div>`;
  return `<div class="product-cards cols-${columns}">${active.map(p => `<article><div class="product-img">${p.cover ? `<img src="${p.cover}" alt="${esc(p.name)}">` : ''}</div><h3>${esc(p.name)}</h3><p>${esc(p.sku)}${p.size ? ' · ' + esc(p.size) : ''}</p></article>`).join('')}</div>`;
}

function sectionHtml(s) {
  if (!s.enabled) return '';
  if (s.type === 'announcement') return `<div data-jh-section="${s.id}" class="ann edit-zone">${direct('span', s, 'text')}</div>`;
  if (s.type === 'header') return `<header data-jh-section="${s.id}" class="site-head edit-zone">${direct('div', s, 'logo', 'logo')}<nav>${directAnchor(s, 'menu1')}${directAnchor(s, 'menu2')}${directAnchor(s, 'menu3')}</nav></header>`;
  if (s.type === 'hero') {
    const img = s.image ? `style="background-image:url('${s.image}')"` : '';
    if (s.layout === 'full') return `<section data-jh-section="${s.id}" class="hero hero-full edit-zone" ${img}><div class="overlay">${direct('p', s, 'eyebrow', 'eyebrow')}${direct('h1', s, 'title')}${direct('p', s, 'text', 'body-copy')}${directAnchor(s, 'button', 'cta')}</div></section>`;
    return `<section data-jh-section="${s.id}" class="hero ${s.layout === 'text-right' ? 'reverse' : ''} edit-zone"><div class="hero-copy">${direct('p', s, 'eyebrow', 'eyebrow')}${direct('h1', s, 'title')}${direct('p', s, 'text', 'body-copy')}${directAnchor(s, 'button', 'cta')}</div><div class="hero-image image-click" data-jh-image="${s.id}" ${img}>${s.image ? '<span class="image-hover-tip">点击后在右侧替换图片</span>' : '<span>点击这里后，在右侧上传首屏图片</span>'}</div></section>`;
  }
  if (s.type === 'benefits') return `<section data-jh-section="${s.id}" class="benefits edit-zone"><div>${direct('b', s, 'title1')}${direct('span', s, 'text1')}</div><div>${direct('b', s, 'title2')}${direct('span', s, 'text2')}</div><div>${direct('b', s, 'title3')}${direct('span', s, 'text3')}</div></section>`;
  if (s.type === 'products') return `<section data-jh-section="${s.id}" id="collection" class="section edit-zone">${direct('p', s, 'eyebrow', 'eyebrow')}${direct('h2', s, 'title')}${productCards(s.count, s.columns)}</section>`;
  if (s.type === 'imageText') {
    const img = s.image ? `style="background-image:url('${s.image}')"` : '';
    return `<section data-jh-section="${s.id}" id="about" class="image-text ${s.position === 'right' ? 'reverse' : ''} edit-zone"><div class="story-image image-click" data-jh-image="${s.id}" ${img}>${s.image ? '<span class="image-hover-tip">点击后在右侧替换图片</span>' : '<span>点击这里后，在右侧上传图片</span>'}</div><div class="story-copy">${direct('p', s, 'eyebrow', 'eyebrow')}${direct('h2', s, 'title')}${direct('p', s, 'text', 'body-copy')}</div></section>`;
  }
  if (s.type === 'contact') return `<section data-jh-section="${s.id}" id="contact" class="contact edit-zone">${direct('p', s, 'eyebrow', 'eyebrow')}${direct('h2', s, 'title')}${direct('p', s, 'text', 'body-copy')}${directAnchor(s, 'button', 'cta')}</section>`;
  if (s.type === 'footer') return `<footer data-jh-section="${s.id}" class="foot edit-zone">${direct('strong', s, 'title')}${direct('span', s, 'text')}</footer>`;
  return '';
}

function previewDoc() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#181714;background:#f4f0e9}a{text-decoration:none;color:inherit}.edit-zone{position:relative;outline:2px solid transparent;outline-offset:-2px}.edit-zone:hover{outline-color:#8aa4ff}.edit-zone.selected{outline-color:#4169e1}.direct-edit{cursor:text;border-radius:3px;transition:box-shadow .15s,background .15s;white-space:pre-line}.direct-edit:hover{box-shadow:0 0 0 2px rgba(65,105,225,.20);background:rgba(65,105,225,.04)}.direct-edit:focus{outline:none;box-shadow:0 0 0 2px #4169e1;background:rgba(255,255,255,.86)}.image-click{cursor:pointer;position:relative}.image-hover-tip{opacity:0;background:rgba(0,0,0,.64);color:#fff;padding:9px 12px;border-radius:6px;transition:.15s}.image-click:hover .image-hover-tip{opacity:1}.ann{background:#211f1b;color:#fff;text-align:center;padding:9px 15px;font-size:10px;letter-spacing:.1em}.site-head{height:74px;padding:0 5vw;display:flex;align-items:center;justify-content:space-between;background:#f4f0e9;border-bottom:1px solid #d9d1c6}.logo{font-family:Georgia,serif;letter-spacing:.16em;font-size:23px}.site-head nav{display:flex;gap:28px;font-size:12px}.hero{min-height:620px;display:grid;grid-template-columns:1.05fr .95fr}.hero.reverse{grid-template-columns:.95fr 1.05fr}.hero.reverse .hero-copy{order:2}.hero-copy{padding:8vw 7vw;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}.eyebrow{font-size:10px;letter-spacing:.17em;color:#9a7752;font-weight:bold;margin:0 0 16px}.hero h1,.section h2,.story-copy h2,.contact h2{font-family:Georgia,serif;font-weight:400;line-height:1.03;margin:0}.hero h1{font-size:clamp(46px,6vw,84px)}.body-copy{color:#716b63;line-height:1.75;max-width:570px;margin:24px 0}.cta{display:inline-block;background:#211f1b;color:#fff;padding:14px 22px;font-size:12px}.hero-image{background:linear-gradient(145deg,#e9e0d5,#b8a694);background-size:cover;background-position:center;display:grid;place-items:center;color:#fff;font-size:12px;min-height:540px}.hero-full{min-height:700px;background:linear-gradient(145deg,#b7a593,#796959);background-size:cover;background-position:center;display:flex;align-items:end;color:#fff}.hero-full .overlay{width:100%;padding:90px 7vw;background:linear-gradient(transparent,rgba(0,0,0,.55))}.hero-full .eyebrow{color:#fff}.hero-full h1{max-width:780px}.hero-full .body-copy{max-width:620px;color:#fff}.hero-full .cta{background:#fff;color:#111}.benefits{display:grid;grid-template-columns:repeat(3,1fr);background:#fff;border-block:1px solid #ddd4c9}.benefits div{padding:26px 5vw;border-right:1px solid #ddd4c9}.benefits div:last-child{border:0}.benefits b,.benefits span{display:block}.benefits b{font-size:12px}.benefits span{font-size:11px;color:#777;margin-top:4px}.section{padding:95px 5vw;background:#faf8f4}.section h2,.story-copy h2,.contact h2{font-size:clamp(36px,4.5vw,62px)}.product-cards{margin-top:38px;display:grid;gap:18px}.cols-2{grid-template-columns:repeat(2,1fr)}.cols-3{grid-template-columns:repeat(3,1fr)}.cols-4{grid-template-columns:repeat(4,1fr)}.product-cards article{background:#fff}.product-img{aspect-ratio:3/4;background:#e8e0d7;overflow:hidden}.product-img img{width:100%;height:100%;object-fit:cover}.product-cards h3{font-family:Georgia,serif;font-weight:400;margin:14px 14px 4px;font-size:18px}.product-cards p{margin:0 14px 16px;color:#777;font-size:10px}.empty-product{grid-column:1/-1;border:1px dashed #bbb;padding:45px;text-align:center;background:#fff;color:#888}.image-text{display:grid;grid-template-columns:1fr 1fr;background:#fff;min-height:500px}.image-text.reverse .story-image{order:2}.story-image{background:linear-gradient(135deg,#d8cdc0,#a6927f);background-size:cover;background-position:center;display:grid;place-items:center;color:#fff;font-size:12px;min-height:430px}.story-copy{padding:8vw 7vw;display:flex;flex-direction:column;justify-content:center}.story-copy .body-copy{color:#756f66;line-height:1.8}.contact{text-align:center;padding:100px 5vw;background:#eee7dd}.contact .body-copy{color:#756f66;max-width:600px;margin:18px auto 26px;line-height:1.7}.foot{background:#211f1b;color:#fff;padding:50px 5vw;display:flex;justify-content:space-between;align-items:end}.foot strong{font-family:Georgia,serif;font-size:46px;font-weight:400}.foot span{font-size:10px;color:#bbb}@media(max-width:800px){.site-head nav{display:none}.hero,.hero.reverse,.image-text{grid-template-columns:1fr}.hero.reverse .hero-copy,.image-text.reverse .story-image{order:initial}.hero-copy{padding:70px 24px 55px}.hero-image{min-height:420px}.benefits{grid-template-columns:1fr}.benefits div{border-right:0;border-bottom:1px solid #ddd4c9}.cols-3,.cols-4{grid-template-columns:repeat(2,1fr)}.section{padding:70px 22px}.story-copy{padding:70px 24px}.foot{flex-direction:column;align-items:flex-start;gap:20px}}@media(max-width:480px){.product-cards,.cols-2,.cols-3,.cols-4{grid-template-columns:1fr}}
</style></head><body>${sections.map(sectionHtml).join('')}<script>(()=>{const send=data=>parent.postMessage(data,'*');function highlight(id){document.querySelectorAll('.edit-zone').forEach(el=>el.classList.remove('selected'));const zone=document.querySelector('[data-jh-section="'+id+'"]');if(zone)zone.classList.add('selected')}document.addEventListener('click',e=>{const zone=e.target.closest('[data-jh-section]');if(zone){const id=zone.dataset.jhSection;highlight(id);send({type:'jh-select',id})}if(e.target.closest('a'))e.preventDefault();const image=e.target.closest('[data-jh-image]');if(image)send({type:'jh-image-select',id:image.dataset.jhImage})});document.addEventListener('input',e=>{const el=e.target.closest('[data-jh-edit]');if(!el)return;send({type:'jh-inline',id:el.dataset.jhSection,key:el.dataset.jhEdit,value:el.innerText.replace(/\\u00a0/g,' ')})});document.addEventListener('keydown',e=>{const el=e.target.closest('[data-jh-edit]');if(el&&el.tagName==='A'&&e.key==='Enter'){e.preventDefault();el.blur()}});window.addEventListener('message',e=>{if(e.data&&e.data.type==='jh-highlight')highlight(e.data.id)});highlight(${JSON.stringify(selectedId)})})();<\/script></body></html>`;
}

function renderPreview() { const frame = $('#previewFrame'); if (frame) frame.srcdoc = previewDoc(); }

window.addEventListener('message', e => {
  const data = e.data;
  if (!data || !data.type) return;
  if (data.type === 'jh-select') { selectedId = data.id; renderSectionList(); renderEditor(); return; }
  if (data.type === 'jh-image-select') { selectedId = data.id; renderSectionList(); renderEditor(); return; }
  if (data.type === 'jh-inline') {
    const s = sections.find(x => x.id === data.id);
    if (!s || !(data.key in s)) return;
    s[data.key] = data.value;
    write(KEYS.theme, sections);
    setSaveState('保存中…');
    const panelField = $(`#sectionEditor [data-key="${CSS.escape(data.key)}"]`);
    if (panelField && document.activeElement !== panelField) panelField.value = data.value;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => setSaveState('已保存'), 180);
  }
});

function addSection(type) {
  const base = { id: uid(), type, enabled: true };
  if (type === 'hero') Object.assign(base, { eyebrow: 'NEW COLLECTION', title: 'New season, new elegance.', text: 'Add your campaign text here.', button: 'VIEW COLLECTION', image: '', layout: 'text-left' });
  if (type === 'products') Object.assign(base, { eyebrow: 'COLLECTION', title: 'Our products', columns: '3', count: '6' });
  if (type === 'imageText') Object.assign(base, { eyebrow: 'STORY', title: 'A title for your story.', text: 'Add a short introduction or collection story.', image: '', position: 'left' });
  if (type === 'benefits') Object.assign(base, { title1: 'Premium materials', text1: 'Carefully selected details', title2: 'Worldwide catalogue', text2: 'Easy to browse anywhere', title3: 'Direct service', text3: 'Contact us for details' });
  if (type === 'contact') Object.assign(base, { eyebrow: 'CONTACT', title: 'Interested in this collection?', text: 'Contact us for availability and more details.', button: 'CONTACT US' });
  if (type === 'announcement') Object.assign(base, { text: 'NEW COLLECTION · WORLDWIDE VIEWING' });
  sections.push(base); selectedId = base.id; persistTheme({ preview: true }); renderSectionList(); renderEditor(); $('#addSectionDialog')?.close();
}

function renderLibrary() {
  const box = $('#sectionLibrary'); if (!box) return;
  box.innerHTML = library.map(x => `<button class="library-card" data-type="${x[0]}"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('');
  $$('.library-card', box).forEach(b => b.onclick = () => addSection(b.dataset.type));
}

function renderProducts() {
  const search = ($('#productSearch')?.value || '').trim().toLowerCase();
  const cat = $('#categoryFilter')?.value || 'all';
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filter = $('#categoryFilter');
  if (filter) filter.innerHTML = '<option value="all">全部分类</option>' + cats.map(c => `<option value="${esc(c)}" ${c === cat ? 'selected' : ''}>${esc(c)}</option>`).join('');
  const list = products.filter(p => { const text = `${p.name || ''} ${p.sku || ''}`.toLowerCase(); return (!search || text.includes(search)) && (cat === 'all' || p.category === cat); });
  const empty = $('#productEmpty'); if (empty) empty.style.display = list.length ? 'none' : 'block';
  const grid = $('#productList'); if (!grid) return;
  grid.innerHTML = list.map(p => `<article class="product-card"><div class="product-thumb">${p.cover ? `<img src="${p.cover}" alt="">` : '暂无图片'}</div><div class="product-card-body"><h3>${esc(p.name)}</h3><div class="product-meta">${esc(p.sku)}${p.size ? ' · ' + esc(p.size) : ''}${p.category ? ' · ' + esc(p.category) : ''}</div><span class="pill ${p.status === 'draft' ? 'draft' : ''}">${p.status === 'active' ? '已上架' : '草稿'}</span><div class="product-actions"><button data-edit="${p.id}">编辑</button><button class="danger" data-delete="${p.id}">删除</button></div></div></article>`).join('');
  $$('[data-edit]', grid).forEach(b => b.onclick = () => openProduct(b.dataset.edit));
  $$('[data-delete]', grid).forEach(b => b.onclick = () => { if (!confirm('确定删除这个商品吗？')) return; products = products.filter(p => p.id !== b.dataset.delete); write(KEYS.products, products); renderProducts(); renderPreview(); });
}

let pendingCover = '';
function openProduct(id = '') {
  const p = products.find(x => x.id === id);
  $('#productDialogTitle').textContent = p ? '编辑商品' : '新增商品'; $('#pId').value = p?.id || ''; $('#pName').value = p?.name || ''; $('#pSku').value = p?.sku || ''; $('#pCategory').value = p?.category || ''; $('#pSize').value = p?.size || ''; $('#pMaterial').value = p?.material || ''; $('#pColor').value = p?.color || ''; $('#pStatus').value = p?.status || 'active'; $('#pDescription').value = p?.description || ''; pendingCover = p?.cover || '';
  const preview = $('#coverPreview'); preview.style.display = pendingCover ? 'block' : 'none'; preview.src = pendingCover || ''; $('#productDialog').showModal();
}

if ($('#pCover')) $('#pCover').onchange = async e => { const f = e.target.files?.[0]; if (!f) return; pendingCover = await imageData(f); const preview = $('#coverPreview'); preview.src = pendingCover; preview.style.display = 'block'; media.unshift({ id: uid(), name: f.name, src: pendingCover }); write(KEYS.media, media); renderMedia(); };

if ($('#productForm')) $('#productForm').onsubmit = e => {
  e.preventDefault(); const id = $('#pId').value || uid();
  const obj = { id, name: $('#pName').value.trim(), sku: $('#pSku').value.trim(), category: $('#pCategory').value.trim(), size: $('#pSize').value.trim(), material: $('#pMaterial').value.trim(), color: $('#pColor').value.trim(), status: $('#pStatus').value, description: $('#pDescription').value.trim(), cover: pendingCover };
  if (!obj.name || !obj.sku) { alert('请填写商品名称和 SKU。'); return; }
  const i = products.findIndex(x => x.id === id); if (i >= 0) products[i] = obj; else products.unshift(obj);
  write(KEYS.products, products); $('#productDialog').close(); renderProducts(); renderPreview();
};

function renderMedia() {
  const grid = $('#mediaGrid'), empty = $('#mediaEmpty'); if (!grid || !empty) return;
  empty.style.display = media.length ? 'none' : 'block';
  grid.innerHTML = media.map(item => `<article class="media-card"><img src="${item.src}" alt="${esc(item.name)}"><div class="media-actions"><span title="${esc(item.name)}">${esc(item.name)}</span><button data-media-delete="${item.id}" title="删除">×</button></div></article>`).join('');
  $$('[data-media-delete]', grid).forEach(btn => btn.onclick = () => { media = media.filter(m => m.id !== btn.dataset.mediaDelete); write(KEYS.media, media); renderMedia(); });
}

if ($('#mediaUpload')) $('#mediaUpload').onchange = async e => { const files = [...(e.target.files || [])]; if (!files.length) return; for (const f of files) { const src = await imageData(f); if (src) media.unshift({ id: uid(), name: f.name, src }); } write(KEYS.media, media); renderMedia(); e.target.value = ''; };

function loadSettings() {
  if (!$('#settingBrand')) return;
  $('#settingBrand').value = settings.brand || 'JINHUAN'; $('#settingLanguage').value = settings.language || 'en'; $('#settingEmail').value = settings.email || ''; $('#settingWhatsapp').value = settings.whatsapp || ''; $('#settingTelegram').value = settings.telegram || '';
}

if ($('#saveSettingsBtn')) $('#saveSettingsBtn').onclick = () => { settings = { brand: $('#settingBrand').value.trim(), language: $('#settingLanguage').value, email: $('#settingEmail').value.trim(), whatsapp: $('#settingWhatsapp').value.trim(), telegram: $('#settingTelegram').value.trim() }; write(KEYS.settings, settings); renderPreview(); alert('店铺设置已保存'); };

$$('.nav-item').forEach(b => b.onclick = () => { $$('.nav-item').forEach(x => x.classList.remove('active')); b.classList.add('active'); $$('.view').forEach(v => v.classList.remove('active')); $(`#view-${b.dataset.view}`)?.classList.add('active'); if (b.dataset.view === 'products') renderProducts(); if (b.dataset.view === 'media') renderMedia(); if (b.dataset.view === 'settings') loadSettings(); });
$$('.device').forEach(b => b.onclick = () => { $$('.device').forEach(x => x.classList.remove('active')); b.classList.add('active'); $('#previewFrame').style.width = b.dataset.width; });
if ($('#addSectionBtn')) $('#addSectionBtn').onclick = () => $('#addSectionDialog').showModal();
$$('.close-modal').forEach(b => b.onclick = () => b.closest('dialog')?.close());
if ($('#newProductBtn')) $('#newProductBtn').onclick = () => openProduct();
if ($('#productSearch')) $('#productSearch').oninput = renderProducts;
if ($('#categoryFilter')) $('#categoryFilter').onchange = renderProducts;
if ($('#previewBtn')) $('#previewBtn').onclick = () => { const w = open('', '_blank'); if (!w) return; w.document.write(previewDoc()); w.document.close(); };
if ($('#publishBtn')) $('#publishBtn').onclick = () => alert('当前装修数据先保存在这台电脑。下一步接云端保存后，“发布”会直接同步到 jinhuan.me 前台。');

renderLibrary();
renderSectionList();
renderEditor();
renderPreview();
renderProducts();
renderMedia();
loadSettings();