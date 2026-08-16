const root=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm=v=>String(v??'').trim().toLowerCase();
const money=(value,code='USD')=>{const n=Number(value||0);const sym={USD:'$',EUR:'€',GBP:'£',RUB:'₽'}[code]||`${code} `;return `${sym}${n.toFixed(2)}`};
const bagPlaceholder=tone=>`<div class="jh-mini-bag ${tone||'dark'}"><i></i></div>`;
const imageHtml=(src,alt='')=>src?`<img src="${esc(src)}" alt="${esc(alt)}">`:'';
const contactHref=(kind,value)=>!value?'#':kind==='email'?(value.startsWith('mailto:')?value:`mailto:${value}`):value;

let state={page:{title:'Home',slug:'home',sections:[]},products:[],categories:[],settings:{brand:'JINHUAN',currency:'USD'}};
const gridPage={};
const gridFilter={};

function activeProducts(){return (state.products||[]).filter(p=>p.status!=='draft')}
function productUrl(p){return `./product.html?sku=${encodeURIComponent(p.sku||p.id||'')}`}
function productCard(p,i){
  const cover=p.cover||p.image||'';
  const cur=p.currency||state.settings?.currency||'USD';
  return `<a class="jh-product-card" href="${productUrl(p)}" data-category="${esc(p.category||'')}">
    <div class="jh-product-photo" style="aspect-ratio:3/4">${cover?imageHtml(cover,p.name):bagPlaceholder(i%3===1?'light':i%3===2?'brown':'dark')}</div>
    <div class="jh-product-copy"><h3>${esc(p.name)}</h3><p>${esc(p.sku||'')}${p.size?' · '+esc(p.size):''}</p><div class="jh-product-price">${money(p.price,cur)}${p.compare_price&&Number(p.compare_price)>Number(p.price||0)?`<del>${money(p.compare_price,cur)}</del>`:''}</div></div>
  </a>`;
}
function categoryNames(){
  const fromCms=(state.categories||[]).map(x=>x.name).filter(Boolean);
  if(fromCms.length)return fromCms;
  return [...new Set(activeProducts().map(x=>x.category).filter(Boolean))];
}
function header(){const s=state.settings||{};return `<div class="jh-announcement">WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE</div><header class="jh-header"><strong>${esc(s.brand||'JINHUAN')}</strong><nav><a href="#collection">Collection</a><a href="#collection">New Arrivals</a><a href="#about">About</a><a href="#contact">Contact</a></nav><button type="button" data-scroll-contact>INQUIRE</button></header>`}
function footer(){const s=state.settings||{};return `<footer class="jh-footer"><strong>${esc(s.brand||'JINHUAN')}</strong><small>© 2026 ${esc(s.brand||'JINHUAN')} · Global Handbag Catalogue</small></footer>`}

function renderGrid(section,index){
  const key=`g${index}`;
  const cats=categoryNames();
  const wanted=gridFilter[key]||'ALL';
  let list=activeProducts();
  if(section.category) list=list.filter(p=>norm(p.category)===norm(section.category));
  if(wanted!=='ALL') list=list.filter(p=>norm(p.category)===norm(wanted));
  const mode=section.mode||'paginate';
  const count=Math.max(1,Number(section.count)||12);
  const cols=Math.min(5,Math.max(2,Number(section.columns)||3));
  const page=Math.max(1,gridPage[key]||1);
  let visible=list,totalPages=1;
  if(mode==='limit') visible=list.slice(0,count);
  if(mode==='paginate'){
    totalPages=Math.max(1,Math.ceil(list.length/count));
    const safe=Math.min(page,totalPages);gridPage[key]=safe;
    visible=list.slice((safe-1)*count,safe*count);
  }
  const filters=section.category?'':`<div class="jh-filters" data-grid-filter="${key}"><button class="${wanted==='ALL'?'active':''}" data-value="ALL">ALL</button>${cats.map(c=>`<button class="${wanted===c?'active':''}" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
  const pagination=mode==='paginate'&&totalPages>1?`<div class="jh-pagination" data-grid-page="${key}">${Array.from({length:totalPages},(_,i)=>i+1).map(n=>`<button class="${n===(gridPage[key]||1)?'active':''}" data-page="${n}">${n}</button>`).join('')}</div>`:'';
  return `<section class="jh-product-section" id="collection"><div class="jh-section-heading"><p class="jh-eyebrow">THE COLLECTION</p><h2>${esc(section.title||'The Collection')}</h2></div>${filters}<div class="jh-product-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr));gap:18px">${visible.length?visible.map(productCard).join(''):'<p class="jh-empty-products">No products yet.</p>'}</div>${pagination}</section>`;
}

function renderSection(section,index){
  const type=section.type;
  if(type==='hero') return `<section class="jh-hero-modern"><div class="jh-hero-copy"><p class="jh-eyebrow">${esc(section.eyebrow||'THE COLLECTION')}</p><h1>${esc(section.title||'Handbags selected for modern elegance.')}</h1><p>${esc(section.text||'')}</p>${section.button_label?`<a class="jh-dark-btn" href="${esc(section.button_link||'#collection')}">${esc(section.button_label)}</a>`:''}</div><div class="jh-hero-media">${section.image?imageHtml(section.image,''):bagPlaceholder('dark')}</div></section>`;
  if(type==='product_grid') return renderGrid(section,index);
  if(type==='image') return `<section class="jh-image-section">${section.image?imageHtml(section.image,section.caption||''):''}${section.caption?`<p>${esc(section.caption)}</p>`:''}</section>`;
  if(type==='editorial') return `<section class="jh-editorial" id="about"><div class="jh-editorial-art">${section.image?imageHtml(section.image,'About'):bagPlaceholder('dark')}</div><div class="jh-editorial-copy"><p class="jh-eyebrow">${esc(section.eyebrow||'ABOUT JINHUAN')}</p><h2>${esc(section.title||'Quiet luxury, thoughtfully selected.')}</h2><p>${esc(section.text||'')}</p></div></section>`;
  if(type==='contact') return `<section class="jh-contact" id="contact"><p class="jh-eyebrow">CONTACT</p><h2>${esc(section.title||'Interested in a product?')}</h2><p>${esc(section.text||'')}</p>${contactButtons()}</section>`;
  return '';
}
function contactButtons(){const s=state.settings||{};return `<div>${s.email?`<a href="${esc(contactHref('email',s.email))}">EMAIL US</a>`:''}${s.whatsapp?`<a href="${esc(s.whatsapp)}" target="_blank" rel="noopener">WHATSAPP</a>`:''}${s.telegram?`<a href="${esc(s.telegram)}" target="_blank" rel="noopener">TELEGRAM</a>`:''}</div>`}

function legacyBlock(block,index){
  const p=block.props||{};const s=state.settings||{};
  if(block.type==='Announcement')return `<div class="jh-announcement">${esc(p.text)}</div>`;
  if(block.type==='Header')return `<header class="jh-header"><strong>${esc(p.brand||s.brand||'JINHUAN')}</strong><nav><a href="#collection">${esc(p.menu1||'Collection')}</a><a href="#collection">${esc(p.menu2||'New Arrivals')}</a><a href="#about">${esc(p.menu3||'About')}</a><a href="#contact">${esc(p.menu4||'Contact')}</a></nav><button type="button" data-scroll-contact>${esc(p.button||'INQUIRE')}</button></header>`;
  if(block.type==='CollectionIntro')return `<section class="jh-collection-head"><div><p class="jh-eyebrow">${esc(p.eyebrow)}</p><h1>${esc(p.title)}</h1></div><p>${esc(p.intro)}</p></section>`;
  if(block.type==='CategoryBar')return '';
  if(block.type==='ProductGrid')return renderGrid({type:'product_grid',title:'The Collection',mode:'paginate',count:Number(p.count)||12,columns:Number(p.columns)||3},index);
  if(block.type==='Editorial')return renderSection({type:'editorial',...p},index);
  if(block.type==='Contact')return renderSection({type:'contact',...p},index);
  if(block.type==='Footer')return footer();
  return '';
}

function bind(){
  document.querySelectorAll('[data-scroll-contact]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})));
  document.querySelectorAll('[data-grid-filter]').forEach(bar=>bar.addEventListener('click',e=>{const b=e.target.closest('[data-value]');if(!b)return;const key=bar.dataset.gridFilter;gridFilter[key]=b.dataset.value;gridPage[key]=1;render()}));
  document.querySelectorAll('[data-grid-page]').forEach(bar=>bar.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;gridPage[bar.dataset.gridPage]=Number(b.dataset.page);render();document.getElementById('collection')?.scrollIntoView({behavior:'smooth'})}));
}
function render(){
  const page=state.page||{};
  let body='';
  if(Array.isArray(page.sections)) body=header()+page.sections.map(renderSection).join('')+footer();
  else if(Array.isArray(page.legacy_content)) body=page.legacy_content.map(legacyBlock).join('');
  else if(Array.isArray(page.content)) body=page.content.map(legacyBlock).join('');
  else body=header()+renderGrid({type:'product_grid',title:'The Collection',mode:'paginate',count:12,columns:3},0)+footer();
  root.className='';root.innerHTML=`<div class="jh-storefront">${body}</div>`;bind();
}

(async()=>{
  for(const url of [`./content/catalog.json?v=${Date.now()}`,`./content/site.json?v=${Date.now()}`]){
    try{const res=await fetch(url,{cache:'no-store'});if(res.ok){const data=await res.json();if(data.version>=3){state=data}else{state={...data,page:data.page||{},categories:data.categories||[]}};break}}catch(e){}
  }
  render();
})();
