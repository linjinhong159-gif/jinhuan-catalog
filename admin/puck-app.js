import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import htm from 'htm';
import {Puck,FieldLabel} from '@puckeditor/core';

const html=htm.bind(React.createElement);
const KEYS={page:'jinhuan_puck_page_v2',products:'jinhuan_products_v2',settings:'jinhuan_settings_v2',token:'jinhuan_github_publish_token_v1'};
const PUBLISH={owner:'linjinhong159-gif',repo:'jinhuan-catalog',branch:'main',path:'content/site.json'};
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>Math.random().toString(36).slice(2,10);
const text=label=>({type:'text',label});
const textarea=label=>({type:'textarea',label});
const number=(label,min,max)=>({type:'number',label,min,max});
const select=(label,options)=>({type:'select',label,options:options.map(([label,value])=>({label,value}))});

async function fileData(file,maxSide=1600,quality=.82){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=reject;el.src=url});
    const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d',{alpha:false});
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',quality);
  }finally{URL.revokeObjectURL(url)}
}

function ImageUploadField({field,value,onChange}){
  return html`<${FieldLabel} label=${field.label||'图片'}><div className="jh-custom-field">
    ${value?html`<img src=${value} alt="preview"/>`:html`<div className="jh-note">还没有图片</div>`}
    <input type="file" accept="image/*" onChange=${async e=>{const f=e.currentTarget.files?.[0];if(f)onChange(await fileData(f));}}/>
    <input type="text" placeholder="或粘贴图片 URL" value=${value||''} onChange=${e=>onChange(e.currentTarget.value)}/>
  </div></${FieldLabel}>`;
}
const imageField={type:'custom',label:'图片',render:ImageUploadField};

function CategoryListField({field,value,onChange}){
  const items=Array.isArray(value)?value:[];
  const change=(i,v)=>onChange(items.map((x,n)=>n===i?v:x));
  const remove=i=>onChange(items.filter((_,n)=>n!==i));
  const add=()=>onChange([...items,`NEW ${items.length}`]);
  return html`<${FieldLabel} label=${field.label||'分类按钮'}><div className="jh-category-editor">
    ${items.map((item,i)=>html`<div className="jh-category-row" key=${i}>
      <span>${i+1}</span><input value=${item||''} onInput=${e=>change(i,e.currentTarget.value)}/>
      <button type="button" title="删除这个分类" onClick=${()=>remove(i)}>×</button>
    </div>`)}
    <button type="button" className="jh-add-category" onClick=${add}>＋ 添加一个分类按钮</button>
    <small>可以无限添加、改名和删除。第一个按钮通常建议保留为 ALL。</small>
  </div></${FieldLabel}>`;
}
const categoryListField={type:'custom',label:'分类按钮',render:CategoryListField};

const defaultSettings={brand:'JINHUAN',email:'',whatsapp:'',telegram:''};
const defaultProducts=[
{id:'demo1',name:'Structured Top Handle',sku:'JH-001',category:'TOP HANDLE',size:'22 × 14 × 8 cm',color:'Black',image:'',status:'active'},
{id:'demo2',name:'Ivory Mini Bag',sku:'JH-002',category:'MINI',size:'19 × 12 × 7 cm',color:'Ivory',image:'',status:'active'},
{id:'demo3',name:'Soft Shoulder Bag',sku:'JH-003',category:'SHOULDER',size:'24 × 16 × 9 cm',color:'Brown',image:'',status:'active'}
];
const defaultPage={content:[
{type:'Announcement',props:{id:'ann1',text:'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'}},
{type:'Header',props:{id:'head1',brand:'JINHUAN',menu1:'Collection',menu2:'New Arrivals',menu3:'About',menu4:'Contact',button:'INQUIRE'}},
{type:'CollectionIntro',props:{id:'intro1',eyebrow:'THE COLLECTION',title:'Handbags selected for modern elegance.',intro:'Category names, products, product count and image layout can all be customized.'}},
{type:'CategoryBar',props:{id:'cat1',items:['ALL','TOP HANDLE','SHOULDER','CROSSBODY','MINI','TOTE']}},
{type:'ProductGrid',props:{id:'grid1',columns:3,count:9,ratio:'3/4',gap:18}},
{type:'Editorial',props:{id:'ed1',eyebrow:'ABOUT JINHUAN',title:'Quiet luxury, thoughtfully selected.',text:'Use this section for your collection story, service or brand introduction.',image:''}},
{type:'Contact',props:{id:'contact1',eyebrow:'CONTACT',title:'Interested in a product?',text:'Contact us directly for product details, availability and collection inquiries.'}},
{type:'Footer',props:{id:'foot1',brand:'JINHUAN',text:'© 2026 JINHUAN · Global Handbag Catalogue'}}
],root:{props:{}}};

function migratePage(input){
  const page=structuredClone(input||defaultPage);
  page.content=(page.content||[]).map(block=>{
    if(block.type==='CategoryBar'&&!Array.isArray(block.props?.items)){
      const p=block.props||{};
      const items=[p.all,p.cat1,p.cat2,p.cat3,p.cat4,p.cat5,p.cat6,p.cat7,p.cat8,p.cat9,p.cat10].filter(x=>typeof x==='string'&&x.trim());
      return {...block,props:{...p,items:items.length?items:['ALL']}};
    }
    return block;
  });
  return page;
}

function bagPlaceholder(tone='dark'){return html`<div className=${`jh-mini-bag ${tone}`}><i></i></div>`}

function makeConfig(products,settings){return {
  categories:{
    layout:{title:'页面模块',components:['Announcement','Header','CollectionIntro','CategoryBar','ProductGrid','Editorial','Contact','Footer']},
    media:{title:'图片',components:['ImageBlock']}
  },
  components:{
    Announcement:{label:'顶部公告',fields:{text:text('公告文字')},defaultProps:{text:'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'},render:p=>html`<div className="jh-announcement">${p.text}</div>`},
    Header:{label:'导航栏',fields:{brand:text('品牌名称'),menu1:text('菜单 1'),menu2:text('菜单 2'),menu3:text('菜单 3'),menu4:text('菜单 4'),button:text('右侧按钮')},defaultProps:{brand:'JINHUAN',menu1:'Collection',menu2:'New Arrivals',menu3:'About',menu4:'Contact',button:'INQUIRE'},render:p=>html`<header className="jh-header"><strong>${p.brand}</strong><nav><a href="#collection">${p.menu1}</a><a href="#collection">${p.menu2}</a><a href="#about">${p.menu3}</a><a href="#contact">${p.menu4}</a></nav><button>${p.button}</button></header>`},
    CollectionIntro:{label:'系列标题',fields:{eyebrow:text('小标题'),title:textarea('大标题'),intro:textarea('右侧说明')},defaultProps:{eyebrow:'THE COLLECTION',title:'Handbags selected for modern elegance.',intro:'Category names, products, product count and image layout can all be customized.'},render:p=>html`<section className="jh-collection-head" id="collection"><div><p className="jh-eyebrow">${p.eyebrow}</p><h1>${p.title}</h1></div><p>${p.intro}</p></section>`},
    CategoryBar:{label:'分类按钮',fields:{items:categoryListField},defaultProps:{items:['ALL','TOP HANDLE','SHOULDER','CROSSBODY','MINI','TOTE']},render:p=>html`<div className="jh-filters">${(Array.isArray(p.items)?p.items:[]).filter(Boolean).map((x,i)=>html`<button className=${i===0?'active':''}>${x}</button>`)}</div>`},
    ProductGrid:{label:'商品区',fields:{columns:number('每行商品数量',2,5),count:number('显示商品数量',1,30),ratio:select('图片比例',[['1 : 1','1/1'],['4 : 5','4/5'],['3 : 4','3/4']]),gap:number('商品间距 px',0,40)},defaultProps:{columns:3,count:9,ratio:'3/4',gap:18},render:p=>{const list=products.filter(x=>x.status!=='draft').slice(0,p.count||9);return html`<section className="jh-product-section"><div className="jh-product-grid" style=${{gridTemplateColumns:`repeat(${p.columns||3},minmax(0,1fr))`,gap:`${p.gap??18}px`}}>${list.map((x,i)=>html`<article className="jh-product-card" key=${x.id}><div className="jh-product-photo" style=${{aspectRatio:p.ratio||'3/4'}}>${x.image?html`<img src=${x.image} alt=${x.name}/>`:bagPlaceholder(i%3===1?'light':i%3===2?'brown':'dark')}</div><div className="jh-product-copy"><h3>${x.name}</h3><p>${x.sku}${x.size?' · '+x.size:''}</p></div></article>`)}</div></section>`}},
    Editorial:{label:'品牌图文',fields:{eyebrow:text('小标题'),title:textarea('标题'),text:textarea('正文'),image:imageField},defaultProps:{eyebrow:'ABOUT JINHUAN',title:'Quiet luxury, thoughtfully selected.',text:'Use this section for your collection story, service or brand introduction.',image:''},render:p=>html`<section className="jh-editorial" id="about"><div className="jh-editorial-art">${p.image?html`<img src=${p.image} alt="About"/>`:bagPlaceholder('dark')}</div><div className="jh-editorial-copy"><p className="jh-eyebrow">${p.eyebrow}</p><h2>${p.title}</h2><p>${p.text}</p></div></section>`},
    Contact:{label:'联系区',fields:{eyebrow:text('小标题'),title:textarea('标题'),text:textarea('正文')},defaultProps:{eyebrow:'CONTACT',title:'Interested in a product?',text:'Contact us directly for product details, availability and collection inquiries.'},render:p=>html`<section className="jh-contact" id="contact"><p className="jh-eyebrow">${p.eyebrow}</p><h2>${p.title}</h2><p>${p.text}</p><div><a href=${settings.email?`mailto:${settings.email}`:'#'}>EMAIL US</a><a href=${settings.whatsapp||'#'}>WHATSAPP</a><a href=${settings.telegram||'#'}>TELEGRAM</a></div></section>`},
    Footer:{label:'页脚',fields:{brand:text('品牌'),text:text('版权')},defaultProps:{brand:'JINHUAN',text:'© 2026 JINHUAN · Global Handbag Catalogue'},render:p=>html`<footer className="jh-footer"><strong>${p.brand}</strong><small>${p.text}</small></footer>`},
    ImageBlock:{label:'自由图片',fields:{image:imageField,height:number('高度 px',120,1000),fit:select('显示方式',[['填满裁切','cover'],['完整显示','contain']]),x:number('左右位置 %',0,100),y:number('上下位置 %',0,100)},defaultProps:{image:'',height:520,fit:'cover',x:50,y:50},render:p=>html`<div className="jh-image-block" style=${{height:`${p.height||520}px`}}>${p.image?html`<img src=${p.image} style=${{objectFit:p.fit||'cover',objectPosition:`${p.x??50}% ${p.y??50}%`}}/>`:html`<span>在右侧上传图片</span>`}</div>`}
  },
  root:{render:({children})=>html`<div className="jh-storefront">${children}</div>`}
}}

function toBase64Utf8(value){const bytes=new TextEncoder().encode(value);let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
async function gh(path,options={}){const token=localStorage.getItem(KEYS.token)||'';if(!token)throw new Error('NO_TOKEN');const res=await fetch(`https://api.github.com/repos/${PUBLISH.owner}/${PUBLISH.repo}/${path}`,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${token}`,...(options.headers||{})}});if(!res.ok){let detail='';try{detail=(await res.json()).message||''}catch{}throw new Error(`GitHub ${res.status}${detail?': '+detail:''}`)}return res.status===204?null:res.json()}
async function uploadDataImage(value,prefix){if(!value||!value.startsWith('data:image/'))return value;const base64=value.slice(value.indexOf(',')+1);const safe=(prefix||'image').replace(/[^a-z0-9_-]/gi,'-').toLowerCase();const path=`assets/published/${safe}-${Date.now()}-${uid()}.jpg`;await gh(`contents/${path}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`Publish image ${safe}`,content:base64,branch:PUBLISH.branch})});return `./${path}`}
async function preparePublished(page,products,settings){const nextPage=migratePage(page);const nextProducts=structuredClone(products);for(const block of nextPage.content||[]){if(block?.props?.image)block.props.image=await uploadDataImage(block.props.image,block.type||'section')}for(const product of nextProducts){if(product?.image)product.image=await uploadDataImage(product.image,product.sku||product.id||'product')}return {version:2,updatedAt:new Date().toISOString(),page:nextPage,products:nextProducts,settings:{...settings}}}
async function publishSite(page,products,settings,setStatus){if(!localStorage.getItem(KEYS.token))throw new Error('NO_TOKEN');setStatus('正在上传图片…');const payload=await preparePublished(page,products,settings);setStatus('正在发布网站…');let sha=null;try{const current=await gh(`contents/${PUBLISH.path}?ref=${encodeURIComponent(PUBLISH.branch)}`);sha=current.sha}catch(err){if(!String(err.message).includes('GitHub 404'))throw err}const body={message:'Publish JINHUAN storefront',content:toBase64Utf8(JSON.stringify(payload,null,2)),branch:PUBLISH.branch};if(sha)body.sha=sha;await gh(`contents/${PUBLISH.path}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});write(KEYS.page,page);write(KEYS.products,products);write(KEYS.settings,settings);setStatus('发布成功')}

function ProductManager({products,setProducts}){
  const blank={name:'',sku:'',category:'',size:'',material:'',color:'',description:'',image:'',status:'active'};
  const[draft,setDraft]=useState(blank);const[editId,setEditId]=useState(null);
  const save=e=>{e.preventDefault();if(!draft.name||!draft.sku)return alert('请填写商品名称和 SKU');const item={...draft,id:editId||uid()};const next=editId?products.map(x=>x.id===editId?item:x):[item,...products.filter(x=>!x.id.startsWith('demo'))];setProducts(next);write(KEYS.products,next);setDraft(blank);setEditId(null)};
  return html`<div className="jh-panel"><div className="jh-pagehead"><div><h1>商品管理</h1><p>这里添加的商品会直接出现在上面的商品区。</p></div></div><form className="jh-card jh-product-form" onSubmit=${save}>
    ${[['商品名称','name'],['SKU','sku'],['分类','category'],['尺寸','size'],['材质','material'],['颜色','color']].map(([l,k])=>html`<label>${l}<input value=${draft[k]||''} onInput=${e=>setDraft({...draft,[k]:e.currentTarget.value})}/></label>`)}
    <label className="jh-span2">商品描述<textarea value=${draft.description||''} onInput=${e=>setDraft({...draft,description:e.currentTarget.value})}></textarea></label>
    <label>商品图片<input type="file" accept="image/*" onChange=${async e=>{const f=e.currentTarget.files?.[0];if(f)setDraft({...draft,image:await fileData(f)})}}/></label>
    <label>状态<select value=${draft.status} onChange=${e=>setDraft({...draft,status:e.currentTarget.value})}><option value="active">上架</option><option value="draft">草稿</option></select></label>
    <div className="jh-span2"><button className="jh-btn" type="submit">${editId?'保存修改':'新增商品'}</button></div>
  </form><div className="jh-product-list">${products.map(x=>html`<article className="jh-admin-product" key=${x.id}><div>${x.image?html`<img src=${x.image}/>`:'暂无图片'}</div><section><h3>${x.name}</h3><p>${x.sku} · ${x.category||''}<br/>${x.size||''}</p><button onClick=${()=>{setDraft({...x});setEditId(x.id);window.scrollTo(0,0)}}>编辑</button>${!x.id.startsWith('demo')?html`<button className="danger" onClick=${()=>{const next=products.filter(p=>p.id!==x.id);setProducts(next);write(KEYS.products,next)}}>删除</button>`:null}</section></article>`)}</div></div>`
}

function Settings({settings,setSettings}){
  const[token,setToken]=useState(localStorage.getItem(KEYS.token)||'');
  const save=()=>{write(KEYS.settings,settings);if(token.trim())localStorage.setItem(KEYS.token,token.trim());else localStorage.removeItem(KEYS.token);alert('已保存设置')};
  return html`<div className="jh-panel"><div className="jh-pagehead"><div><h1>店铺设置</h1><p>品牌、联系方式和发布连接。</p></div></div><div className="jh-card jh-settings">
    ${[['网站名称','brand'],['联系邮箱','email'],['WhatsApp 链接','whatsapp'],['Telegram 链接','telegram']].map(([l,k])=>html`<label>${l}<input value=${settings[k]||''} onInput=${e=>setSettings({...settings,[k]:e.currentTarget.value})}/></label>`)}
    <hr><label>GitHub 发布密钥<input type="password" autocomplete="off" placeholder="github_pat_..." value=${token} onInput=${e=>setToken(e.currentTarget.value)}/><small className="jh-setting-note">只保存在你当前浏览器，不会写入网页或仓库。需要 Contents 读写权限。</small></label>
    <button className="jh-btn" onClick=${save}>保存设置</button>
  </div></div>`
}

function App(){
  const[view,setView]=useState('editor');
  const[products,setProducts]=useState(read(KEYS.products,defaultProducts));
  const[settings,setSettings]=useState(read(KEYS.settings,defaultSettings));
  const[status,setStatus]=useState('未发布');
  const config=useMemo(()=>makeConfig(products,settings),[products,settings]);
  const page=migratePage(read(KEYS.page,defaultPage));
  const doPublish=async data=>{write(KEYS.page,migratePage(data));try{await publishSite(data,products,settings,setStatus);alert('发布成功。GitHub Pages 会自动更新，稍后刷新 jinhuan.me 即可看到新版本。')}catch(err){setStatus('发布失败');if(err.message==='NO_TOKEN'){setView('settings');alert('还差一次性设置：请在“店铺设置”中填写 GitHub 发布密钥，保存后再点 Publish。')}else alert(`发布失败：${err.message}`)}};
  return html`<div className="jh-shell"><header className="jh-topbar"><div className="jh-brand"><div className="jh-mark">JH</div><div><strong>JINHUAN Visual Editor</strong><small>保存后直接发布到 jinhuan.me</small></div></div><nav className="jh-tabs">${[['editor','页面装修'],['products','商品管理'],['settings','店铺设置']].map(([k,l])=>html`<button className=${`jh-tab ${view===k?'active':''}`} onClick=${()=>setView(k)}>${l}</button>`)}</nav><div className="jh-top-actions"><span className="jh-publish-status">${status}</span><a className="jh-open" href="../" target="_blank">查看前台</a></div></header><main className="jh-main">
    ${view==='editor'?html`<div className="jh-puck-wrap"><${Puck} config=${config} data=${page} viewports=${[{width:1440,label:'Desktop'},{width:768,label:'Tablet'},{width:390,label:'Mobile'}]} onChange=${data=>{write(KEYS.page,migratePage(data));setStatus('有未发布修改')}} onPublish=${doPublish} /></div>`:null}
    ${view==='products'?html`<${ProductManager} products=${products} setProducts=${next=>{setProducts(next);setStatus('有未发布修改')}}/>`:null}
    ${view==='settings'?html`<${Settings} settings=${settings} setSettings=${next=>{setSettings(next);setStatus('有未发布修改')}}/>`:null}
  </main></div>`;
}

createRoot(document.getElementById('root')).render(html`<${App}/>`);