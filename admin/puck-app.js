import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import htm from 'htm';
import {Puck, FieldLabel} from '@puckeditor/core';

const html=htm.bind(React.createElement);
const KEYS={page:'jinhuan_puck_page_v1',products:'jinhuan_products_v1',media:'jinhuan_media_v1',settings:'jinhuan_settings_v1'};
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>Math.random().toString(36).slice(2,10);
const fileData=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});

const defaultProducts=[];
const defaultSettings={brand:'JINHUAN',email:'',whatsapp:'',telegram:''};
const defaultPage={
  content:[
    {type:'Announcement',props:{id:'ann-1',text:'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'}},
    {type:'Header',props:{id:'head-1',brand:'JINHUAN',menu1:'Collection',menu2:'About',menu3:'Contact'}},
    {type:'Hero',props:{id:'hero-1',eyebrow:'CURATED HANDBAGS',title:'Timeless elegance, made to be carried.',text:'Discover refined handbags with elegant silhouettes, versatile styling, and carefully selected details for modern everyday luxury.',button:'VIEW COLLECTION',image:'',layout:'text-left',imageWidth:82,imageHeight:560,imageFit:'cover',imageX:50,imageY:50}},
    {type:'Benefits',props:{id:'benefit-1',title1:'Refined Design',text1:'Elegant silhouettes with timeless appeal.',title2:'Detailed Product Information',text2:'Clear size, material, color and SKU details.',title3:'Direct Inquiry',text3:'Contact us directly for availability and selection.'}},
    {type:'ProductGrid',props:{id:'products-1',eyebrow:'THE COLLECTION',title:'Handbags selected for modern elegance.',columns:3,count:6}},
    {type:'ImageText',props:{id:'story-1',eyebrow:'ABOUT JINHUAN',title:'Quiet luxury, thoughtfully selected.',text:'Introduce your business, collection story or service here.',image:'',position:'left',imageWidth:86,imageHeight:520,imageFit:'cover',imageX:50,imageY:50}},
    {type:'Contact',props:{id:'contact-1',eyebrow:'CONTACT',title:'Interested in a product?',text:'Contact us directly for product details, availability and collection inquiries.',button:'CONTACT US'}},
    {type:'Footer',props:{id:'footer-1',brand:'JINHUAN',text:'© 2026 JINHUAN · Global Handbag Catalogue'}}
  ],root:{props:{}}
};

function ImageUploadField({field,value,onChange}){
  return html`<${FieldLabel} label=${field.label||'图片'}>
    <div className="jh-custom-field">
      ${value?html`<img src=${value} alt="preview"/>`:html`<div className="jh-note">还没有图片</div>`}
      <input type="file" accept="image/*" onChange=${async e=>{const f=e.currentTarget.files?.[0];if(!f)return;onChange(await fileData(f));}}/>
      <input type="text" placeholder="或粘贴图片 URL" value=${value||''} onChange=${e=>onChange(e.currentTarget.value)}/>
      <div className="jh-note">上传后可继续调宽度、高度、裁切方式和图片位置。</div>
    </div>
  </${FieldLabel}>`;
}
const imageField={type:'custom',label:'图片',render:ImageUploadField};
const select=(label,options)=>({type:'select',label,options:options.map(([label,value])=>({label,value}))});
const number=(label,min,max)=>({type:'number',label,min,max});
const text=(label)=>({type:'text',label});
const textarea=(label)=>({type:'textarea',label});

function mediaStyle(p){return {width:`${p.imageWidth||100}%`,height:`${p.imageHeight||500}px`,objectFit:p.imageFit||'cover',objectPosition:`${p.imageX??50}% ${p.imageY??50}%`};}

function makeConfig(products,settings){return {
  categories:{layout:{title:'基础布局',components:['Announcement','Header','Hero','Benefits','ProductGrid','ImageText','Contact','Footer']},media:{title:'图片组件',components:['ImageBlock']}},
  components:{
    Announcement:{label:'顶部公告',fields:{text:text('公告文字')},defaultProps:{text:'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'},render:({text})=>html`<div className="jh-announcement">${text}</div>`},
    Header:{label:'导航栏',fields:{brand:text('品牌名称'),menu1:text('菜单 1'),menu2:text('菜单 2'),menu3:text('菜单 3')},defaultProps:{brand:'JINHUAN',menu1:'Collection',menu2:'About',menu3:'Contact'},render:p=>html`<header className="jh-header"><div className="jh-logo">${p.brand}</div><nav className="jh-navlinks"><a>${p.menu1}</a><a>${p.menu2}</a><a>${p.menu3}</a></nav></header>`},
    Hero:{label:'首屏 Hero',fields:{eyebrow:text('小标题'),title:textarea('主标题'),text:textarea('说明文字'),button:text('按钮文字'),image:imageField,layout:select('版式',[['文字左 / 图片右','text-left'],['图片左 / 文字右','text-right']]),imageWidth:number('图片宽度 %',30,120),imageHeight:number('图片区域高度 px',280,900),imageFit:select('图片显示方式',[['填满裁切','cover'],['完整显示','contain']]),imageX:number('图片左右位置 %',0,100),imageY:number('图片上下位置 %',0,100)},defaultProps:{eyebrow:'CURATED HANDBAGS',title:'Timeless elegance, made to be carried.',text:'Discover refined handbags with elegant silhouettes and refined details.',button:'VIEW COLLECTION',image:'',layout:'text-left',imageWidth:82,imageHeight:560,imageFit:'cover',imageX:50,imageY:50},render:p=>html`<section className=${`jh-hero ${p.layout==='text-right'?'reverse':''}`}><div className="jh-hero-copy"><p className="jh-eyebrow">${p.eyebrow}</p><h1>${p.title}</h1><p>${p.text}</p><a className="jh-cta">${p.button}</a></div><div className="jh-hero-media">${p.image?html`<img src=${p.image} style=${mediaStyle(p)} alt="Hero"/>`:html`<span>在右侧上传图片</span>`}</div></section>`},
    Benefits:{label:'三大卖点',fields:{title1:text('卖点 1 标题'),text1:text('卖点 1 说明'),title2:text('卖点 2 标题'),text2:text('卖点 2 说明'),title3:text('卖点 3 标题'),text3:text('卖点 3 说明')},defaultProps:{title1:'Refined Design',text1:'Elegant silhouettes with timeless appeal.',title2:'Detailed Product Information',text2:'Clear size, material, color and SKU details.',title3:'Direct Inquiry',text3:'Contact us directly for availability.'},render:p=>html`<section className="jh-benefits"><div><b>${p.title1}</b><span>${p.text1}</span></div><div><b>${p.title2}</b><span>${p.text2}</span></div><div><b>${p.title3}</b><span>${p.text3}</span></div></section>`},
    ProductGrid:{label:'商品列表',fields:{eyebrow:text('小标题'),title:textarea('标题'),columns:number('每行商品数量',2,5),count:number('显示商品数量',1,24)},defaultProps:{eyebrow:'THE COLLECTION',title:'Handbags selected for modern elegance.',columns:3,count:6},render:p=>{const list=products.filter(x=>x.status!=='draft').slice(0,p.count||6);return html`<section className="jh-section"><p className="jh-eyebrow">${p.eyebrow}</p><h2>${p.title}</h2><div className="jh-product-grid-view" style=${{gridTemplateColumns:`repeat(${p.columns||3},minmax(0,1fr))`}}>${list.length?list.map(x=>html`<article key=${x.id}><div className="photo">${x.image?html`<img src=${x.image} alt=${x.name}/>`:null}</div><div className="info"><h3>${x.name}</h3><p>${x.sku}${x.size?' · '+x.size:''}</p></div></article>`):html`<div className="jh-card">还没有商品，请到顶部“商品管理”新增。</div>`}</div></section>`}},
    ImageText:{label:'图文介绍',fields:{eyebrow:text('小标题'),title:textarea('标题'),text:textarea('正文'),image:imageField,position:select('图片位置',[['图片左','left'],['图片右','right']]),imageWidth:number('图片宽度 %',30,120),imageHeight:number('图片区域高度 px',260,900),imageFit:select('图片显示方式',[['填满裁切','cover'],['完整显示','contain']]),imageX:number('图片左右位置 %',0,100),imageY:number('图片上下位置 %',0,100)},defaultProps:{eyebrow:'ABOUT JINHUAN',title:'Quiet luxury, thoughtfully selected.',text:'Introduce your business or collection story here.',image:'',position:'left',imageWidth:86,imageHeight:520,imageFit:'cover',imageX:50,imageY:50},render:p=>html`<section className=${`jh-story ${p.position==='right'?'reverse':''}`}><div className="jh-story-image">${p.image?html`<img src=${p.image} style=${mediaStyle(p)} alt="Story"/>`:html`<span>在右侧上传图片</span>`}</div><div className="jh-story-copy"><p className="jh-eyebrow">${p.eyebrow}</p><h2>${p.title}</h2><p>${p.text}</p></div></section>`},
    Contact:{label:'联系区',fields:{eyebrow:text('小标题'),title:textarea('标题'),text:textarea('说明'),button:text('按钮')},defaultProps:{eyebrow:'CONTACT',title:'Interested in a product?',text:'Contact us directly for product details and availability.',button:'CONTACT US'},render:p=>html`<section className="jh-contact"><p className="jh-eyebrow">${p.eyebrow}</p><h2>${p.title}</h2><p>${p.text}</p><a className="jh-cta" href=${settings.email?`mailto:${settings.email}`:'#'}>${p.button}</a></section>`},
    Footer:{label:'页脚',fields:{brand:text('品牌文字'),text:text('版权信息')},defaultProps:{brand:'JINHUAN',text:'© 2026 JINHUAN · Global Handbag Catalogue'},render:p=>html`<footer className="jh-footer"><strong>${p.brand}</strong><span>${p.text}</span></footer>`},
    ImageBlock:{label:'自由图片',fields:{image:imageField,imageWidth:number('图片宽度 %',10,120),imageHeight:number('图片高度 px',100,1000),imageFit:select('显示方式',[['填满裁切','cover'],['完整显示','contain']]),imageX:number('左右位置 %',0,100),imageY:number('上下位置 %',0,100)},defaultProps:{image:'',imageWidth:70,imageHeight:480,imageFit:'cover',imageX:50,imageY:50},render:p=>html`<div className="jh-image-block" style=${{height:`${p.imageHeight||480}px`}}>${p.image?html`<img src=${p.image} style=${mediaStyle(p)} alt=""/>`:html`<span>上传图片</span>`}</div>`}
  },
  root:{render:({children})=>html`<div className="jh-shop">${children}</div>`}
};}

function ProductManager({products,setProducts}){
 const empty={name:'',sku:'',category:'',size:'',material:'',color:'',description:'',image:'',status:'active'};
 const [draft,setDraft]=useState(empty); const [editId,setEditId]=useState(null);
 const saveProduct=e=>{e.preventDefault();if(!draft.name||!draft.sku)return alert('请填写商品名称和 SKU');const item={...draft,id:editId||uid()};const next=editId?products.map(x=>x.id===editId?item:x):[item,...products];setProducts(next);write(KEYS.products,next);setDraft(empty);setEditId(null)};
 const load=x=>{setDraft({...x});setEditId(x.id);window.scrollTo({top:0,behavior:'smooth'})};
 return html`<div className="jh-panel"><div className="jh-pagehead"><div><h1>商品管理</h1><p>这是自定义后台，不需要进入 Squidex 才能填写商品。</p></div></div><form className="jh-card jh-product-form" onSubmit=${saveProduct}>
 ${[['商品名称','name'],['SKU','sku'],['分类','category'],['尺寸','size'],['材质','material'],['颜色','color']].map(([l,k])=>html`<label>${l}<input value=${draft[k]||''} onInput=${e=>setDraft({...draft,[k]:e.currentTarget.value})}/></label>`)}
 <label className="jh-span2">商品描述<textarea value=${draft.description||''} onInput=${e=>setDraft({...draft,description:e.currentTarget.value})}></textarea></label>
 <label>商品图片<input type="file" accept="image/*" onChange=${async e=>{const f=e.currentTarget.files?.[0];if(f)setDraft({...draft,image:await fileData(f)})}}/></label>
 <label>状态<select value=${draft.status} onChange=${e=>setDraft({...draft,status:e.currentTarget.value})}><option value="active">上架</option><option value="draft">草稿</option></select></label>
 <div className="jh-span2"><button className="jh-btn" type="submit">${editId?'保存修改':'新增商品'}</button>${editId?html`<button className="jh-btn secondary" type="button" onClick=${()=>{setDraft(empty);setEditId(null)}}>取消</button>`:null}</div></form>
 <div className="jh-product-list">${products.map(x=>html`<article className="jh-product-card" key=${x.id}><div className="jh-product-thumb">${x.image?html`<img src=${x.image} alt=${x.name}/>`:'暂无图片'}</div><div className="jh-product-body"><h3>${x.name}</h3><div className="jh-meta">${x.sku} · ${x.category||''}<br/>${x.size||''} ${x.color||''}</div><div className="jh-product-actions"><button onClick=${()=>load(x)}>编辑</button><button className="jh-danger" onClick=${()=>{const next=products.filter(p=>p.id!==x.id);setProducts(next);write(KEYS.products,next)}}>删除</button></div></div></article>`)}</div></div>`;
}

function MediaManager(){const [media,setMedia]=useState(read(KEYS.media,[]));return html`<div className="jh-panel"><div className="jh-pagehead"><div><h1>图片素材</h1><p>上传常用 Banner、模特图、商品图。</p></div><label className="jh-btn">＋ 上传图片<input hidden type="file" accept="image/*" multiple onChange=${async e=>{const arr=[];for(const f of [...e.currentTarget.files])arr.push({id:uid(),name:f.name,src:await fileData(f)});const next=[...arr,...media];setMedia(next);write(KEYS.media,next)}}/></label></div><div className="jh-media-grid">${media.map(m=>html`<div className="jh-media-card" key=${m.id}><img src=${m.src} alt=${m.name}/><footer>${m.name}</footer></div>`)}</div></div>`}
function Settings(){const [s,setS]=useState(read(KEYS.settings,defaultSettings));return html`<div className="jh-panel"><div className="jh-pagehead"><div><h1>店铺设置</h1><p>品牌与联系方式。</p></div></div><div className="jh-card jh-settings">${[['网站名称','brand'],['联系邮箱','email'],['WhatsApp','whatsapp'],['Telegram','telegram']].map(([l,k])=>html`<label>${l}<input value=${s[k]||''} onInput=${e=>setS({...s,[k]:e.currentTarget.value})}/></label>`)}<button className="jh-btn" onClick=${()=>{write(KEYS.settings,s);alert('已保存')}}>保存设置</button></div></div>`}

function App(){
 const [view,setView]=useState('editor');const [products,setProducts]=useState(read(KEYS.products,defaultProducts));const [settings]=useState(read(KEYS.settings,defaultSettings));const [status,setStatus]=useState('自动保存');
 const config=useMemo(()=>makeConfig(products,settings),[products,settings]);const page=read(KEYS.page,defaultPage);
 return html`<div className="jh-shell"><header className="jh-topbar"><div className="jh-brand"><div className="jh-mark">JH</div><div><strong>Puck Visual Editor</strong><small>JINHUAN 独立站后台</small></div></div><nav className="jh-tabs">${[['editor','页面装修'],['products','商品管理'],['media','图片素材'],['settings','店铺设置']].map(([k,l])=>html`<button className=${`jh-tab ${view===k?'active':''}`} onClick=${()=>setView(k)}>${l}</button>`)}</nav><div className="jh-actions"><span className="jh-status">${status}</span><a href="../" target="_blank">打开前台</a></div></header><main className="jh-main">
 ${view==='editor'?html`<div className="jh-puck-wrap"><${Puck} key=${products.length} config=${config} data=${page} height="100%" viewports=${[{width:1440,label:'Desktop'},{width:768,label:'Tablet'},{width:390,label:'Mobile'}]} onChange=${data=>{write(KEYS.page,data);setStatus('已自动保存')}} onPublish=${async data=>{write(KEYS.page,data);setStatus('已保存到当前浏览器');alert('页面设计已保存。下一步我会把“发布”接到 GitHub，让 jinhuan.me 所有访客都看到同一版。')}} /></div>`:null}
 ${view==='products'?html`<${ProductManager} products=${products} setProducts=${setProducts}/>`:null}${view==='media'?html`<${MediaManager}/>`:null}${view==='settings'?html`<${Settings}/>`:null}
 </main></div>`;
}
createRoot(document.getElementById('root')).render(html`<${App}/>`);
