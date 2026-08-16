const root=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm=v=>String(v??'').trim().toLowerCase();
const defaultData={
  page:{content:[
    {type:'Announcement',props:{text:'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'}},
    {type:'Header',props:{brand:'JINHUAN',menu1:'Collection',menu2:'New Arrivals',menu3:'About',menu4:'Contact',button:'INQUIRE'}},
    {type:'CollectionIntro',props:{eyebrow:'THE COLLECTION',title:'Handbags selected for modern elegance.',intro:'Explore our selected handbag catalogue.'}},
    {type:'CategoryBar',props:{items:['ALL','TOP HANDLE','SHOULDER','CROSSBODY','MINI','TOTE']}},
    {type:'ProductGrid',props:{columns:3,count:9,ratio:'3/4',gap:18}},
    {type:'Editorial',props:{eyebrow:'ABOUT JINHUAN',title:'Quiet luxury, thoughtfully selected.',text:'A product-first catalogue for international clients.',image:''}},
    {type:'Contact',props:{eyebrow:'CONTACT',title:'Interested in a product?',text:'Contact us directly for product details and availability.'}},
    {type:'Footer',props:{brand:'JINHUAN',text:'© 2026 JINHUAN · Global Handbag Catalogue'}}
  ]},
  products:[
    {id:'demo1',name:'Structured Top Handle',sku:'JH-001',category:'TOP HANDLE',size:'22 × 14 × 8 cm',material:'',color:'Black',description:'',image:'',status:'active'},
    {id:'demo2',name:'Ivory Mini Bag',sku:'JH-002',category:'MINI',size:'19 × 12 × 7 cm',material:'',color:'Ivory',description:'',image:'',status:'active'},
    {id:'demo3',name:'Soft Shoulder Bag',sku:'JH-003',category:'SHOULDER',size:'24 × 16 × 9 cm',material:'',color:'Brown',description:'',image:'',status:'active'}
  ],settings:{brand:'JINHUAN',email:'',whatsapp:'',telegram:''}
};
let state=defaultData;

function categoryItems(p={}){
  if(Array.isArray(p.items))return p.items.filter(Boolean);
  return [p.all,p.cat1,p.cat2,p.cat3,p.cat4,p.cat5,p.cat6,p.cat7,p.cat8,p.cat9,p.cat10].filter(Boolean);
}
function bagPlaceholder(tone='dark'){return `<div class="jh-mini-bag ${tone}"><i></i></div>`}
function imageHtml(src,alt=''){return src?`<img src="${esc(src)}" alt="${esc(alt)}">`:''}
function contactHref(kind,value){if(!value)return '#';if(kind==='email')return value.startsWith('mailto:')?value:`mailto:${value}`;return value}

function renderBlock(block,index){
  const p=block.props||{};const s=state.settings||{};
  switch(block.type){
    case 'Announcement':return `<div class="jh-announcement">${esc(p.text)}</div>`;
    case 'Header':return `<header class="jh-header"><strong>${esc(p.brand||s.brand||'JINHUAN')}</strong><nav><a href="#collection">${esc(p.menu1||'Collection')}</a><a href="#collection">${esc(p.menu2||'New Arrivals')}</a><a href="#about">${esc(p.menu3||'About')}</a><a href="#contact">${esc(p.menu4||'Contact')}</a></nav><button type="button" data-scroll-contact>${esc(p.button||'INQUIRE')}</button></header>`;
    case 'CollectionIntro':return `<section class="jh-collection-head" id="collection"><div><p class="jh-eyebrow">${esc(p.eyebrow)}</p><h1>${esc(p.title)}</h1></div><p>${esc(p.intro)}</p></section>`;
    case 'CategoryBar':{const items=categoryItems(p);return `<div class="jh-filters" data-filter-bar>${items.map((x,i)=>`<button type="button" class="${i===0?'active':''}" data-filter="${esc(x)}">${esc(x)}</button>`).join('')}</div>`}
    case 'ProductGrid':{
      const list=(state.products||[]).filter(x=>x.status!=='draft').slice(0,Number(p.count)||9);
      const cols=Math.min(5,Math.max(2,Number(p.columns)||3));
      const gap=Math.min(40,Math.max(0,Number(p.gap)??18));
      const ratio=p.ratio||'3/4';
      return `<section class="jh-product-section"><div class="jh-product-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr));gap:${gap}px">${list.map((x,i)=>`<article class="jh-product-card" data-category="${esc(x.category||'')}" data-product="${esc(x.id||x.sku||i)}" tabindex="0"><div class="jh-product-photo" style="aspect-ratio:${esc(ratio)}">${x.image?imageHtml(x.image,x.name):bagPlaceholder(i%3===1?'light':i%3===2?'brown':'dark')}</div><div class="jh-product-copy"><h3>${esc(x.name)}</h3><p>${esc(x.sku)}${x.size?' · '+esc(x.size):''}</p></div></article>`).join('')}</div></section>`;
    }
    case 'Editorial':return `<section class="jh-editorial" id="about"><div class="jh-editorial-art">${p.image?imageHtml(p.image,'About'):bagPlaceholder('dark')}</div><div class="jh-editorial-copy"><p class="jh-eyebrow">${esc(p.eyebrow)}</p><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p></div></section>`;
    case 'Contact':return `<section class="jh-contact" id="contact"><p class="jh-eyebrow">${esc(p.eyebrow)}</p><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p><div>${s.email?`<a href="${esc(contactHref('email',s.email))}">EMAIL US</a>`:''}${s.whatsapp?`<a href="${esc(s.whatsapp)}" target="_blank" rel="noopener">WHATSAPP</a>`:''}${s.telegram?`<a href="${esc(s.telegram)}" target="_blank" rel="noopener">TELEGRAM</a>`:''}</div></section>`;
    case 'Footer':return `<footer class="jh-footer"><strong>${esc(p.brand||s.brand||'JINHUAN')}</strong><small>${esc(p.text)}</small></footer>`;
    case 'ImageBlock':return `<div class="jh-image-block" style="height:${Math.max(120,Math.min(1000,Number(p.height)||520))}px">${p.image?`<img src="${esc(p.image)}" alt="" style="object-fit:${p.fit==='contain'?'contain':'cover'};object-position:${Number(p.x)??50}% ${Number(p.y)??50}%">`:''}</div>`;
    default:return '';
  }
}

function productModal(){return `<div class="jh-modal" id="productModal" hidden><button class="jh-modal-close" type="button" aria-label="Close">×</button><div class="jh-modal-card"><div class="jh-modal-image"></div><div class="jh-modal-copy"><p class="jh-eyebrow">PRODUCT DETAILS</p><h2></h2><dl></dl><p class="jh-modal-description"></p></div></div></div>`}
function bindInteractions(){
  document.querySelectorAll('[data-scroll-contact]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})));
  const filterBar=document.querySelector('[data-filter-bar]');
  if(filterBar){filterBar.addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(!btn)return;filterBar.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));const wanted=norm(btn.dataset.filter);const all=wanted==='all'||wanted==='全部';document.querySelectorAll('.jh-product-card').forEach(card=>{card.hidden=!all&&norm(card.dataset.category)!==wanted})})}
  const modal=document.getElementById('productModal');
  const open=id=>{const product=(state.products||[]).find(x=>String(x.id||x.sku)===String(id));if(!product||!modal)return;modal.querySelector('.jh-modal-image').innerHTML=product.image?imageHtml(product.image,product.name):bagPlaceholder('dark');modal.querySelector('h2').textContent=product.name||'';const rows=[['SKU',product.sku],['Category',product.category],['Size',product.size],['Material',product.material],['Color',product.color]].filter(([,v])=>v);modal.querySelector('dl').innerHTML=rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');modal.querySelector('.jh-modal-description').textContent=product.description||'';modal.hidden=false;document.body.style.overflow='hidden'};
  document.querySelectorAll('.jh-product-card').forEach(card=>{card.addEventListener('click',()=>open(card.dataset.product));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(card.dataset.product)}})});
  modal?.querySelector('.jh-modal-close')?.addEventListener('click',()=>{modal.hidden=true;document.body.style.overflow=''});
  modal?.addEventListener('click',e=>{if(e.target===modal){modal.hidden=true;document.body.style.overflow=''}});
}
function render(){root.innerHTML=`<div class="jh-storefront">${(state.page?.content||[]).map(renderBlock).join('')}</div>${productModal()}`;bindInteractions()}

(async()=>{
  try{
    const res=await fetch(`./content/site.json?v=${Date.now()}`,{cache:'no-store'});
    if(res.ok)state=await res.json();
  }catch(e){console.warn('Using default storefront data',e)}
  render();
})();