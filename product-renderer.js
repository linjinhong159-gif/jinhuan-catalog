const app=document.getElementById('productApp');
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=(value,code='USD')=>{const n=Number(value||0);const sym={USD:'$',EUR:'€',GBP:'£',RUB:'₽'}[code]||`${code} `;return `${sym}${n.toFixed(2)}`};
const q=new URLSearchParams(location.search);const sku=q.get('sku')||'';

function contactLinks(settings,product){
  const msg=encodeURIComponent(`Hello, I am interested in ${product.name} (${product.sku}).`);
  const email=settings.email?`<a href="mailto:${esc(settings.email)}?subject=${encodeURIComponent(product.name)}">EMAIL US</a>`:'';
  let wa='';if(settings.whatsapp){const sep=settings.whatsapp.includes('?')?'&':'?';wa=`<a target="_blank" rel="noopener" href="${esc(settings.whatsapp)}${sep}text=${msg}">WHATSAPP</a>`}
  const tg=settings.telegram?`<a target="_blank" rel="noopener" href="${esc(settings.telegram)}">TELEGRAM</a>`:'';
  return `<div class="jh-product-actions">${email}${wa}${tg}</div>`;
}
function render(data){
  const p=(data.products||[]).find(x=>String(x.sku||x.id)===sku);
  const s=data.settings||{};
  if(!p){app.className='';app.innerHTML=`<div class="jh-storefront"><header class="jh-header"><strong>${esc(s.brand||'JINHUAN')}</strong><a href="./">BACK TO COLLECTION</a></header><div class="jh-product-not-found"><h1>Product not found</h1><a class="jh-dark-btn" href="./">BACK TO COLLECTION</a></div></div>`;return}
  document.title=`${p.name} · ${s.brand||'JINHUAN'}`;
  const images=[p.cover,...(Array.isArray(p.images)?p.images:[])].filter(Boolean);
  const main=images[0]||'';const cur=p.currency||s.currency||'USD';
  const rows=[['SKU',p.sku],['Category',p.category],['Size',p.size],['Material',p.material],['Color',p.color]].filter(([,v])=>v);
  app.className='';app.innerHTML=`<div class="jh-storefront"><div class="jh-announcement">WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE</div><header class="jh-header"><strong>${esc(s.brand||'JINHUAN')}</strong><nav><a href="./">Collection</a><a href="./#about">About</a><a href="./#contact">Contact</a></nav><a class="jh-back-link" href="./">BACK</a></header><main class="jh-product-detail"><section class="jh-detail-gallery"><div class="jh-detail-main">${main?`<img id="mainProductImage" src="${esc(main)}" alt="${esc(p.name)}">`:'<div class="jh-detail-placeholder">No image</div>'}</div>${images.length>1?`<div class="jh-detail-thumbs">${images.map((img,i)=>`<button class="${i===0?'active':''}" data-img="${esc(img)}"><img src="${esc(img)}" alt=""></button>`).join('')}</div>`:''}</section><section class="jh-detail-copy"><p class="jh-eyebrow">${esc(p.category||'THE COLLECTION')}</p><h1>${esc(p.name)}</h1><div class="jh-detail-price">${money(p.price,cur)}${p.compare_price&&Number(p.compare_price)>Number(p.price||0)?`<del>${money(p.compare_price,cur)}</del>`:''}</div><dl>${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${p.description?`<div class="jh-detail-description">${esc(p.description).replace(/\n/g,'<br>')}</div>`:''}${contactLinks(s,p)}</section></main></div>`;
  document.querySelectorAll('[data-img]').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById('mainProductImage').src=btn.dataset.img;document.querySelectorAll('[data-img]').forEach(b=>b.classList.toggle('active',b===btn))}));
}
(async()=>{try{const res=await fetch(`./content/catalog.json?v=${Date.now()}`,{cache:'no-store'});if(!res.ok)throw new Error('catalog');render(await res.json())}catch(e){app.innerHTML='<div class="jh-error">Unable to load product catalogue.</div>'}})();
