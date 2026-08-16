const JH_KEYS = {
  project: 'jh_visual_project_v1',
  products: 'jh_products_v1',
  media: 'jh_media_v1',
  settings: 'jh_settings_v1'
};

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHTML = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

let products = readJSON(JH_KEYS.products, []);
let media = readJSON(JH_KEYS.media, []);
let settings = readJSON(JH_KEYS.settings, {
  brand: 'JINHUAN', language: 'en', email: '', whatsapp: '', telegram: ''
});
let currentCoverData = '';

const baseCss = `
  *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#171717;background:#f5f1eb}.jh-section{padding:90px 6vw}.jh-hero{min-height:660px;display:grid;grid-template-columns:1.05fr .95fr;background:#f4f0e9}.jh-hero-copy{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:8vw}.jh-eyebrow{font-size:11px;letter-spacing:.18em;color:#9a7752;font-weight:700;margin:0 0 18px}.jh-hero h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(50px,6vw,88px);line-height:1.02;margin:0}.jh-hero p{font-size:16px;line-height:1.7;color:#756f66;max-width:580px;margin:24px 0}.jh-btn{display:inline-block;background:#1f1d19;color:#fff;padding:15px 24px;text-decoration:none;font-size:13px}.jh-hero-image{background:linear-gradient(145deg,#e9e0d5,#b8a694);min-height:580px;display:grid;place-items:center}.jh-placeholder-bag{width:52%;height:45%;border-radius:12px 12px 28px 28px;background:#221f1c;position:relative}.jh-placeholder-bag:before{content:'';position:absolute;width:42%;height:48%;border:15px solid #221f1c;border-bottom:0;border-radius:999px 999px 0 0;left:29%;top:-30%}.jh-features{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #ddd2c6;border-bottom:1px solid #ddd2c6;background:#fff}.jh-feature{padding:30px 5vw;border-right:1px solid #ddd2c6}.jh-feature:last-child{border-right:0}.jh-feature strong{display:block;font-size:13px}.jh-feature span{display:block;font-size:12px;color:#777;margin-top:5px}.jh-title{font-family:Georgia,serif;font-weight:400;font-size:clamp(38px,4.5vw,64px);line-height:1.05;margin:0 0 32px}.jh-text{color:#746f68;font-size:15px;line-height:1.8}.jh-image-text{display:grid;grid-template-columns:1fr 1fr;min-height:520px}.jh-image-text .image{background:linear-gradient(135deg,#d8cdc0,#a6927f);min-height:420px;background-size:cover;background-position:center}.jh-image-text .copy{padding:8vw 7vw;background:#fff;display:flex;flex-direction:column;justify-content:center}.jh-products{background:#faf8f4}.jh-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.jh-product-card{background:#fff;border:1px solid #e2dbd2}.jh-product-img{aspect-ratio:3/4;background:#e8e0d7;overflow:hidden}.jh-product-img img{width:100%;height:100%;object-fit:cover}.jh-product-info{padding:16px}.jh-product-info h3{font-family:Georgia,serif;font-weight:400;font-size:19px;margin:0 0 5px}.jh-product-info p{font-size:11px;color:#777;margin:0}.jh-product-empty{grid-column:1/-1;border:1px dashed #cfc5ba;padding:45px;text-align:center;color:#8a8178;background:#fff}.jh-banner{min-height:390px;background:#23201c;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:70px 8vw}.jh-banner h2{font-family:Georgia,serif;font-size:clamp(40px,5vw,72px);font-weight:400;margin:0 0 16px}.jh-banner p{max-width:620px;margin:auto;color:#cbc5bd;line-height:1.7}.jh-contact{text-align:center;background:#eee7dd}.jh-spacer{height:70px}.jh-footer{background:#1f1d19;color:#fff;padding:55px 6vw;display:flex;justify-content:space-between;align-items:end}.jh-footer strong{font-family:Georgia,serif;font-size:44px;font-weight:400;letter-spacing:.08em}.jh-footer span{font-size:11px;color:#bbb}
  @media(max-width:800px){.jh-hero,.jh-image-text{grid-template-columns:1fr}.jh-hero-copy{padding:70px 24px}.jh-hero-image{min-height:430px}.jh-features{grid-template-columns:1fr}.jh-feature{border-right:0;border-bottom:1px solid #ddd2c6}.jh-product-grid{grid-template-columns:1fr 1fr}.jh-section{padding:70px 24px}.jh-footer{flex-direction:column;align-items:flex-start;gap:20px}}@media(max-width:520px){.jh-product-grid{grid-template-columns:1fr}}
`;

function productGridHtml(){
  const active = products.filter(p => p.status === 'active');
  if(!active.length){
    return `<div class="jh-product-empty">商品将在这里显示<br><small>进入“商品管理”新增商品后，点击后台顶部“刷新商品模块”</small></div>`;
  }
  return active.slice(0,12).map(p => `
    <article class="jh-product-card">
      <div class="jh-product-img">${p.cover ? `<img src="${p.cover}" alt="${escapeHTML(p.name)}">` : ''}</div>
      <div class="jh-product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.sku)} · ${escapeHTML(p.size || p.category || '')}</p></div>
    </article>`).join('');
}

const initialHtml = `
  <section class="jh-hero">
    <div class="jh-hero-copy"><p class="jh-eyebrow">CURATED HANDBAGS</p><h1>Quiet elegance,<br>made to be carried.</h1><p>Discover our handbag catalogue. Browse the collection and contact us directly for product details.</p><a class="jh-btn" href="#products">VIEW COLLECTION</a></div>
    <div class="jh-hero-image"><div class="jh-placeholder-bag"></div></div>
  </section>
  <section class="jh-features"><div class="jh-feature"><strong>Worldwide viewing</strong><span>Fast product catalogue</span></div><div class="jh-feature"><strong>Detailed products</strong><span>Size · Material · Color · SKU</span></div><div class="jh-feature"><strong>Direct inquiry</strong><span>Contact us for any item</span></div></section>
  <section class="jh-section jh-products" id="products"><p class="jh-eyebrow">THE COLLECTION</p><h2 class="jh-title">Featured products</h2><div class="jh-product-grid" data-jh-product-grid>${productGridHtml()}</div></section>
  <section class="jh-image-text"><div class="image"></div><div class="copy"><p class="jh-eyebrow">ABOUT JINHUAN</p><h2 class="jh-title">Made for clear product discovery.</h2><p class="jh-text">Use this area to introduce your business, craftsmanship, service or collection story.</p></div></section>
  <section class="jh-section jh-contact"><p class="jh-eyebrow">CONTACT</p><h2 class="jh-title">Interested in a product?</h2><p class="jh-text">Contact us directly for availability and details.</p></section>
  <footer class="jh-footer"><strong>JINHUAN</strong><span>© 2026 JINHUAN · Global Product Catalogue</span></footer>
`;

const savedProject = readJSON(JH_KEYS.project, null);
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  width: 'auto',
  fromElement: false,
  storageManager: false,
  panels: { defaults: [] },
  blockManager: { appendTo: '#blocks' },
  traitManager: { appendTo: '#traits' },
  styleManager: {
    appendTo: '#styles',
    sectors: [
      { name:'尺寸与间距', open:true, buildProps:['width','height','min-height','max-width','margin','padding'] },
      { name:'排版', open:false, buildProps:['font-family','font-size','font-weight','letter-spacing','color','line-height','text-align','text-decoration'] },
      { name:'背景', open:false, buildProps:['background-color','background-image','background-size','background-position'] },
      { name:'边框与效果', open:false, buildProps:['border','border-radius','box-shadow','opacity'] },
      { name:'布局', open:false, buildProps:['display','flex-direction','justify-content','align-items','gap','grid-template-columns'] }
    ]
  },
  layerManager: { appendTo: '#layers' },
  deviceManager: {
    devices: [
      { name:'Desktop', width:'' },
      { name:'Tablet', width:'768px', widthMedia:'900px' },
      { name:'Mobile portrait', width:'390px', widthMedia:'480px' }
    ]
  },
  assetManager: { upload:false }
});

if(savedProject){
  try { editor.loadProjectData(savedProject); } catch { editor.setComponents(initialHtml); editor.setStyle(baseCss); }
} else {
  editor.setComponents(initialHtml);
  editor.setStyle(baseCss);
}

const bm = editor.BlockManager;
const addBlock = (id,label,content,category='常用模块',media='▦') => bm.add(id,{label,content,category,media});
addBlock('hero','首屏 Banner',`<section class="jh-hero"><div class="jh-hero-copy"><p class="jh-eyebrow">NEW COLLECTION</p><h1>New season,<br>new elegance.</h1><p>Write your campaign text here.</p><a class="jh-btn" href="#products">VIEW COLLECTION</a></div><div class="jh-hero-image"><div class="jh-placeholder-bag"></div></div></section>`,'首页模块','▰');
addBlock('products','商品网格',`<section class="jh-section jh-products"><p class="jh-eyebrow">COLLECTION</p><h2 class="jh-title">Our products</h2><div class="jh-product-grid" data-jh-product-grid>${productGridHtml()}</div></section>`,'商品模块','▦');
addBlock('features','三栏卖点',`<section class="jh-features"><div class="jh-feature"><strong>Premium materials</strong><span>Carefully selected details</span></div><div class="jh-feature"><strong>Worldwide catalogue</strong><span>Easy to browse anywhere</span></div><div class="jh-feature"><strong>Direct service</strong><span>Contact us for details</span></div></section>`,'首页模块','☷');
addBlock('image-text','图片 + 文字',`<section class="jh-image-text"><div class="image"></div><div class="copy"><p class="jh-eyebrow">STORY</p><h2 class="jh-title">A title for your story.</h2><p class="jh-text">Add a short introduction, collection story, material details or service promise.</p></div></section>`,'内容模块','◩');
addBlock('banner','通栏大标题',`<section class="jh-banner"><div><p class="jh-eyebrow">JINHUAN</p><h2>Elegant by design.</h2><p>Use this section as a campaign banner, brand statement or seasonal message.</p></div></section>`,'内容模块','▰');
addBlock('heading','标题',`<h2 class="jh-title" style="padding:20px 6vw">Section title</h2>`,'基础组件','H');
addBlock('text','文字',`<p class="jh-text" style="padding:20px 6vw">Click to edit this text. Add product information, a brand story or service description.</p>`,'基础组件','T');
addBlock('image','图片',`<img src="https://placehold.co/1200x800/ddd4ca/766b60?text=Upload+Image" style="display:block;width:100%;max-height:700px;object-fit:cover" alt="">`,'基础组件','▧');
addBlock('button','按钮',`<div style="padding:22px 6vw"><a class="jh-btn" href="#">BUTTON</a></div>`,'基础组件','▣');
addBlock('contact','联系模块',`<section class="jh-section jh-contact"><p class="jh-eyebrow">CONTACT</p><h2 class="jh-title">Interested in this collection?</h2><p class="jh-text">Contact us for availability and more details.</p><a class="jh-btn" href="mailto:hello@jinhuan.me">CONTACT US</a></section>`,'内容模块','✉');
addBlock('spacer','空白间距',`<div class="jh-spacer"></div>`,'基础组件','↕');
addBlock('footer','页脚',`<footer class="jh-footer"><strong>JINHUAN</strong><span>© 2026 JINHUAN · Global Product Catalogue</span></footer>`,'网站结构','▬');

media.forEach(item => editor.AssetManager.add({src:item.src,name:item.name}));

let saveTimer;
editor.on('update', () => {
  $('#saveState').textContent = '正在保存…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    writeJSON(JH_KEYS.project, editor.getProjectData());
    $('#saveState').textContent = '草稿已保存';
  }, 500);
});

$$('.device-btn').forEach(btn => btn.addEventListener('click', () => {
  editor.setDevice(btn.dataset.device);
  $$('.device-btn').forEach(b => b.classList.toggle('active', b === btn));
}));

$$('.property-tab').forEach(btn => btn.addEventListener('click', () => {
  $$('.property-tab').forEach(b => b.classList.toggle('active', b === btn));
  $$('.prop-panel').forEach(p => p.classList.remove('active'));
  $(`#prop-${btn.dataset.prop}`).classList.add('active');
}));

$$('.nav-item[data-panel]').forEach(btn => btn.addEventListener('click', () => {
  $$('.nav-item[data-panel]').forEach(b => b.classList.toggle('active', b === btn));
  $$('.app-panel').forEach(p => p.classList.remove('active'));
  $(`#panel-${btn.dataset.panel}`).classList.add('active');
}));

function completeHtml(){
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(settings.brand || 'JINHUAN')}</title><style>${editor.getCss()}</style></head><body>${editor.getHtml()}</body></html>`;
}

$('#previewBtn').addEventListener('click', () => {
  const blob = new Blob([completeHtml()], {type:'text/html'});
  window.open(URL.createObjectURL(blob), '_blank');
});
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([completeHtml()], {type:'text/html'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'jinhuan-homepage.html'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
});

function showMessage(title, html){
  $('#messageTitle').textContent = title;
  $('#messageBody').innerHTML = html;
  $('#messageDialog').showModal();
}
$$('.close-message').forEach(b => b.addEventListener('click', () => $('#messageDialog').close()));
$('#publishBtn').addEventListener('click', () => showMessage('发布功能正在等待云端连接', `
  <p>可视化后台已经可以装修、上传图片和管理商品。现在的修改会安全保存在你当前浏览器里。</p>
  <p>要做到“点发布 → 全球客户立刻看到”，下一步需要连接免费的 <b>Firebase</b>：</p>
  <p><code>Authentication</code> 管理后台登录<br><code>Firestore</code> 保存装修和商品<br><code>Storage</code> 保存商品图片</p>
  <p>连接完成后，这个“发布网站”按钮会直接发布到 <b>jinhuan.me</b>。</p>`));
$('#firebaseHelpBtn').addEventListener('click', () => showMessage('Firebase 下一步', `<p>先不用现在配置。等你确认这个拖拽后台操作方式符合你的习惯后，我再继续把 Firebase 接进来。</p><p>届时你只需要创建一个 Firebase 项目，把网页应用配置给我，其他代码我继续完成。</p>`));

function refreshProductGrids(){
  const grids = editor.DomComponents.getWrapper().find('[data-jh-product-grid]');
  grids.forEach(grid => grid.components(productGridHtml()));
  writeJSON(JH_KEYS.project, editor.getProjectData());
  $('#saveState').textContent = '商品模块已刷新';
  setTimeout(()=>$('#saveState').textContent='草稿已保存',1400);
}
$('#refreshProductsBtn').addEventListener('click', refreshProductGrids);

function categories(){ return [...new Set(products.map(p=>p.category).filter(Boolean))].sort(); }
function renderProducts(){
  const query = ($('#productSearch').value || '').toLowerCase();
  const category = $('#categoryFilter').value || 'all';
  const filtered = products.filter(p => (category==='all'||p.category===category) && (`${p.name} ${p.sku}`.toLowerCase().includes(query)));
  $('#productEmpty').style.display = products.length ? 'none' : 'block';
  $('#productList').innerHTML = filtered.map(p => `<article class="product-card">
    <div class="product-thumb">${p.cover?`<img src="${p.cover}" alt="${escapeHTML(p.name)}">`:'暂无图片'}</div>
    <div class="product-card-body"><h3>${escapeHTML(p.name)}</h3><div class="product-meta"><span>${escapeHTML(p.sku)}</span><span>${escapeHTML(p.category||'未分类')}</span><span>${escapeHTML(p.size||'')}</span></div><span class="status-pill ${p.status==='draft'?'draft':''}">${p.status==='active'?'已上架':'草稿'}</span><div class="product-actions"><button data-edit="${p.id}">编辑</button><button data-duplicate="${p.id}">复制</button><button class="danger" data-delete="${p.id}">删除</button></div></div>
  </article>`).join('');
  $('#categoryFilter').innerHTML = `<option value="all">全部分类</option>` + categories().map(c=>`<option value="${escapeHTML(c)}" ${c===category?'selected':''}>${escapeHTML(c)}</option>`).join('');
}

function resetProductForm(){
  $('#productForm').reset(); $('#pId').value=''; currentCoverData=''; $('#coverPreview').style.display='none'; $('#coverPreview').src=''; $('#coverHint').textContent='点击选择图片'; $('#productDialogTitle').textContent='新增商品';
}
function openProduct(product){
  resetProductForm();
  if(product){
    $('#productDialogTitle').textContent='编辑商品'; $('#pId').value=product.id; $('#pName').value=product.name||''; $('#pSku').value=product.sku||''; $('#pCategory').value=product.category||''; $('#pSize').value=product.size||''; $('#pMaterial').value=product.material||''; $('#pColor').value=product.color||''; $('#pStatus').value=product.status||'active'; $('#pDescription').value=product.description||''; currentCoverData=product.cover||'';
    if(currentCoverData){ $('#coverPreview').src=currentCoverData; $('#coverPreview').style.display='block'; $('#coverHint').textContent='点击可更换图片'; }
  }
  $('#productDialog').showModal();
}
$('#newProductBtn').addEventListener('click',()=>openProduct());
$('#pCover').addEventListener('change', e => {
  const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{currentCoverData=reader.result; $('#coverPreview').src=currentCoverData; $('#coverPreview').style.display='block'; $('#coverHint').textContent=file.name;}; reader.readAsDataURL(file);
});
$('#saveProductBtn').addEventListener('click', e => {
  e.preventDefault(); if(!$('#pName').value.trim()||!$('#pSku').value.trim()){showMessage('请补充信息','<p>商品名称和 SKU 为必填项。</p>');return;}
  const id=$('#pId').value||`p_${Date.now()}`; const product={id,name:$('#pName').value.trim(),sku:$('#pSku').value.trim(),category:$('#pCategory').value.trim(),size:$('#pSize').value.trim(),material:$('#pMaterial').value.trim(),color:$('#pColor').value.trim(),status:$('#pStatus').value,description:$('#pDescription').value.trim(),cover:currentCoverData,updatedAt:Date.now()};
  const idx=products.findIndex(p=>p.id===id); if(idx>=0)products[idx]=product; else products.unshift(product); writeJSON(JH_KEYS.products,products); renderProducts(); $('#productDialog').close(); refreshProductGrids();
});
$('#productList').addEventListener('click', e => {
  const edit=e.target.dataset.edit, del=e.target.dataset.delete, duplicate=e.target.dataset.duplicate;
  if(edit) openProduct(products.find(p=>p.id===edit));
  if(del && confirm('确定删除这个商品吗？')){products=products.filter(p=>p.id!==del);writeJSON(JH_KEYS.products,products);renderProducts();refreshProductGrids();}
  if(duplicate){const source=products.find(p=>p.id===duplicate);if(source){products.unshift({...source,id:`p_${Date.now()}`,name:`${source.name} Copy`,sku:`${source.sku}-COPY`,updatedAt:Date.now()});writeJSON(JH_KEYS.products,products);renderProducts();}}
});
$('#productSearch').addEventListener('input',renderProducts); $('#categoryFilter').addEventListener('change',renderProducts);

function renderMedia(){
  $('#mediaEmpty').style.display=media.length?'none':'block';
  $('#mediaGrid').innerHTML=media.map((m,i)=>`<div class="media-card"><img src="${m.src}" alt=""><div class="media-actions"><span title="${escapeHTML(m.name)}">${escapeHTML(m.name)}</span><button data-media-delete="${i}">删除</button></div></div>`).join('');
}
$('#mediaUpload').addEventListener('change', async e => {
  const files=[...e.target.files];
  for(const file of files){
    const src=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file)});
    const item={name:file.name,src,createdAt:Date.now()}; media.unshift(item); editor.AssetManager.add({src,name:file.name});
  }
  try{writeJSON(JH_KEYS.media,media);}catch{showMessage('图片太多','<p>第一阶段使用浏览器本地存储，空间有限。Firebase Storage 接好后就不会有这个限制。</p>');}
  renderMedia(); e.target.value='';
});
$('#mediaGrid').addEventListener('click',e=>{if(e.target.dataset.mediaDelete!==undefined){media.splice(Number(e.target.dataset.mediaDelete),1);writeJSON(JH_KEYS.media,media);renderMedia();}});

$('#settingBrand').value=settings.brand||'JINHUAN'; $('#settingLanguage').value=settings.language||'en'; $('#settingEmail').value=settings.email||''; $('#settingWhatsapp').value=settings.whatsapp||''; $('#settingTelegram').value=settings.telegram||'';
$('#saveSettingsBtn').addEventListener('click',()=>{settings={brand:$('#settingBrand').value.trim()||'JINHUAN',language:$('#settingLanguage').value,email:$('#settingEmail').value.trim(),whatsapp:$('#settingWhatsapp').value.trim(),telegram:$('#settingTelegram').value.trim()};writeJSON(JH_KEYS.settings,settings);showMessage('设置已保存','<p>品牌和联系方式已经保存在当前后台草稿中。</p>');});

renderProducts(); renderMedia();
