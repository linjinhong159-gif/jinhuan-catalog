(function(){
  function v(entry,key,fallback){var x=entry.getIn(['data',key]);return x===undefined||x===null||x===''?fallback:x}
  function asset(props,value){if(!value)return '';try{var a=props.getAsset(value);return a&&a.toString?a.toString():String(a||'')}catch(e){return String(value||'')}}
  function currency(code){return ({USD:'$',EUR:'€',GBP:'£',RUB:'₽'})[code]||((code||'USD')+' ')}
  function arr(value){if(!value)return [];try{return value.toJS?value.toJS():Array.isArray(value)?value:[]}catch(e){return []}}

  var ProductPreview=createClass({
    render:function(){
      var e=this.props.entry;
      var cover=v(e,'cover','');
      var images=arr(e.getIn(['data','images']));
      var all=[cover].concat(images).filter(Boolean);
      var title=v(e,'name','商品名称');
      var price=Number(v(e,'price',0));
      var compare=Number(v(e,'compare_price',0));
      var cur=v(e,'currency','USD');
      var specs=[['SKU',v(e,'sku','')],['Category',v(e,'category','')],['Size',v(e,'size','')],['Material',v(e,'material','')],['Color',v(e,'color','')]].filter(function(x){return x[1]});
      return h('div',{className:'pv-product'},
        h('div',{className:'pv-product-head'},h('div',{className:'pv-brand'},'JINHUAN'),h('div',{className:'pv-meta'},'PRODUCT DETAIL PREVIEW')),
        h('div',{className:'pv-product-main'},
          h('div',{className:'pv-gallery'},
            h('div',{className:'pv-cover'},all[0]?h('img',{src:asset(this.props,all[0]),alt:title}):h('span',{className:'pv-meta'},'上传主图后这里会显示')),
            all.length>1?h('div',{className:'pv-thumbs'},all.slice(0,10).map(function(img,i){return h('div',{className:'pv-thumb',key:i},h('img',{src:asset(this.props,img),alt:''}))}.bind(this))):null
          ),
          h('div',{className:'pv-product-copy'},
            h('p',{className:'pv-eyebrow'},v(e,'category','THE COLLECTION')),
            h('div',{className:'pv-product-title'},title),
            h('div',{className:'pv-meta'},v(e,'sku','SKU')),
            h('div',{className:'pv-product-price'},currency(cur)+price.toFixed(2),compare>price?h('del',{},currency(cur)+compare.toFixed(2)):null),
            h('div',{className:'pv-specs'},specs.map(function(x,i){return h('div',{className:'pv-spec',key:i},h('b',{},x[0]),h('span',{},x[1]))})),
            h('div',{className:'pv-description'},this.props.widgetFor('description'))
          )
        )
      )
    }
  });

  var PagePreview=createClass({
    renderSection:function(section,i){
      var type=section.type;
      if(type==='hero'){
        var src=asset(this.props,section.image);
        return h('section',{className:'pv-hero',key:i},h('div',{className:'pv-hero-copy'},h('p',{className:'pv-eyebrow'},section.eyebrow||'CURATED HANDBAGS'),h('h1',{},section.title||'Handbags selected for modern elegance.'),h('p',{},section.text||''),section.button_label?h('span',{className:'pv-btn'},section.button_label):null),h('div',{className:'pv-hero-media'},src?h('img',{src:src,alt:''}):h('span',{className:'pv-meta'},'Hero image')))
      }
      if(type==='product_grid'){
        var count=Math.min(Number(section.count)||6,6);
        var cards=[];for(var n=0;n<count;n++)cards.push(h('div',{className:'pv-card',key:n},h('div',{className:'pv-card-img'}),h('div',{className:'pv-card-copy'},h('strong',{},'Product '+(n+1)),h('span',{},section.category||'ALL'),h('span',{className:'pv-price'},'$0.00'))));
        return h('section',{className:'pv-section',key:i},h('div',{className:'pv-section-tag'},'PRODUCT GRID'),h('h2',{},section.title||'The Collection'),h('div',{className:'pv-grid',style:{gridTemplateColumns:'repeat('+Math.min(Math.max(Number(section.columns)||3,2),5)+',minmax(0,1fr))'}},cards))
      }
      if(type==='image'){
        var im=asset(this.props,section.image);return h('section',{className:'pv-image',key:i},im?h('img',{src:im,alt:section.caption||''}):h('div',{className:'pv-empty'},'图片模块'),section.caption?h('p',{className:'pv-meta'},section.caption):null)
      }
      if(type==='editorial'){
        var ed=asset(this.props,section.image);return h('section',{className:'pv-editorial',key:i},h('div',{className:'pv-editorial-media'},ed?h('img',{src:ed,alt:''}):null),h('div',{className:'pv-editorial-copy'},h('p',{className:'pv-eyebrow'},section.eyebrow||'ABOUT JINHUAN'),h('h2',{},section.title||'Quiet luxury, thoughtfully selected.'),h('p',{},section.text||'')))
      }
      if(type==='contact')return h('section',{className:'pv-contact',key:i},h('p',{className:'pv-eyebrow'},'CONTACT'),h('h2',{},section.title||'Interested in a product?'),h('p',{},section.text||''),h('span',{className:'pv-btn'},'CONTACT US'));
      return h('div',{className:'pv-empty',key:i},'模块预览')
    },
    render:function(){
      var e=this.props.entry;var sections=arr(e.getIn(['data','sections']));
      return h('div',{className:'pv-shell'},
        h('div',{className:'pv-top'},'WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE'),
        h('header',{className:'pv-header'},h('div',{className:'pv-brand'},'JINHUAN'),h('nav',{className:'pv-nav'},h('span',{},'Collection'),h('span',{},'New Arrivals'),h('span',{},'About'),h('span',{},'Contact')),h('span',{className:'pv-btn'},'INQUIRE')),
        sections.length?sections.map(this.renderSection.bind(this)):h('div',{className:'pv-empty'},'在左侧添加页面模块后，这里会实时显示前台效果。'),
        h('footer',{className:'pv-footer'},h('strong',{},'JINHUAN'),h('span',{},'© 2026 JINHUAN · Global Handbag Catalogue'))
      )
    }
  });

  var CategoryPreview=createClass({render:function(){var e=this.props.entry;var src=asset(this.props,v(e,'image',''));return h('div',{className:'pv-shell'},h('section',{className:'pv-section'},h('p',{className:'pv-eyebrow'},'CATEGORY'),h('h2',{},v(e,'name','分类名称')),src?h('div',{className:'pv-image'},h('img',{src:src,alt:''})):null,h('p',{},v(e,'description',''))))}});
  var SettingsPreview=createClass({render:function(){var e=this.props.entry;return h('div',{className:'pv-shell'},h('div',{className:'pv-top'},'STORE SETTINGS PREVIEW'),h('header',{className:'pv-header'},h('div',{className:'pv-brand'},v(e,'brand','JINHUAN')),h('span',{className:'pv-btn'},'INQUIRE')),h('section',{className:'pv-contact'},h('p',{className:'pv-eyebrow'},'CONTACT'),h('h2',{},'Interested in a product?'),h('p',{},v(e,'email','Add your contact details in the editor.'))))}});

  CMS.registerPreviewStyle('/admin/preview.css');
  CMS.registerPreviewTemplate('products',ProductPreview);
  CMS.registerPreviewTemplate('pages',PagePreview);
  CMS.registerPreviewTemplate('categories',CategoryPreview);
  CMS.registerPreviewTemplate('store_settings',SettingsPreview);
})();
