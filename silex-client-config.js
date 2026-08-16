// Auto-seed the Silex canvas with the existing JINHUAN luxury storefront concept.
// This runs only when the current website is visually empty.
export default async function (config) {
  config.on('silex:startup:end', () => {
    const editor = window.silex?.getEditor?.() || config.getEditor?.()
    if (!editor) return

    const wrapper = editor.getWrapper?.()
    const children = wrapper?.components?.()
    const count = children?.length ?? children?.models?.length ?? 0
    if (count > 0) return

    const html = `
      <div class="notice">WORLDWIDE HANDBAG CATALOGUE · DIRECT INQUIRY AVAILABLE</div>
      <header class="nav">
        <a class="logo" href="#top">JINHUAN</a>
        <nav class="links">
          <a href="#collection">Collection</a>
          <a href="#collection">New Arrivals</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a class="nav-cta" href="#contact">INQUIRE</a>
      </header>
      <main id="top">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">CURATED HANDBAGS</p>
            <h1>Timeless elegance,<br>made to be carried.</h1>
            <p class="lead">Discover refined handbags with elegant silhouettes, versatile styling, and carefully selected details for modern everyday luxury.</p>
            <a class="button" href="#collection">VIEW COLLECTION <span>→</span></a>
          </div>
          <div class="hero-art">
            <div class="hero-stage">
              <div class="bag"><div class="bag-handle"></div><div class="bag-body"></div><div class="bag-lock"></div></div>
            </div>
          </div>
        </section>
        <section class="trust">
          <div><b>Refined Design</b><span>Elegant silhouettes with timeless appeal.</span></div>
          <div><b>Detailed Product Information</b><span>Clear size, material, color and SKU details.</span></div>
          <div><b>Direct Inquiry</b><span>Contact us directly for availability and selection.</span></div>
        </section>
        <section class="section" id="collection">
          <div class="section-head">
            <div><p class="eyebrow">THE COLLECTION</p><h2>Handbags selected<br>for modern elegance.</h2></div>
            <p class="section-intro">Category names, products, product count and image layout can all be customized.</p>
          </div>
          <div class="filters">
            <button class="filter active">ALL</button><button class="filter">TOP HANDLE</button><button class="filter">SHOULDER</button><button class="filter">CROSSBODY</button><button class="filter">MINI</button><button class="filter">TOTE</button>
          </div>
          <div class="grid">
            <article class="card"><div class="product-img"><div class="mini-bag"></div></div><div class="card-copy"><h3>Structured Top Handle</h3><div class="meta">JH-001 · 22 × 14 × 8 CM</div><div class="price-note">VIEW DETAILS</div></div></article>
            <article class="card"><div class="product-img"><div class="mini-bag light"></div></div><div class="card-copy"><h3>Ivory Mini Bag</h3><div class="meta">JH-002 · 19 × 12 × 7 CM</div><div class="price-note">VIEW DETAILS</div></div></article>
            <article class="card"><div class="product-img"><div class="mini-bag brown"></div></div><div class="card-copy"><h3>Soft Shoulder Bag</h3><div class="meta">JH-003 · 24 × 16 × 9 CM</div><div class="price-note">VIEW DETAILS</div></div></article>
          </div>
        </section>
        <section class="editorial" id="about">
          <div class="editorial-art"><div class="bag"><div class="bag-handle"></div><div class="bag-body"></div><div class="bag-lock"></div></div></div>
          <div class="editorial-copy"><p class="eyebrow">ABOUT JINHUAN</p><h2>Quiet luxury,<br>thoughtfully selected.</h2><p>This section can be moved, resized or removed in Silex. Text and images are fully editable, while product data can continue to come from Squidex.</p><a class="button" href="#contact">CONTACT US <span>→</span></a></div>
        </section>
        <section class="contact" id="contact"><p class="eyebrow">CONTACT</p><h2>Interested in a product?</h2><p>Contact us directly for product details, availability and collection inquiries.</p><div class="contact-actions"><a class="button" href="#">EMAIL US</a><a class="button" href="#">WHATSAPP</a><a class="button" href="#">TELEGRAM</a></div></section>
      </main>
      <footer class="footer"><strong>JINHUAN</strong><small>© 2026 JINHUAN · Global Handbag Catalogue</small></footer>
    `

    const css = `
      :root{--ivory:#f5f1ea;--paper:#fffdf9;--ink:#161411;--muted:#746d65;--line:#ddd5cb;--dark:#1b1916;--accent:#9d7750}
      *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--ivory);color:var(--ink);font-family:Arial,Helvetica,sans-serif}.notice{background:var(--dark);color:#fff;text-align:center;padding:8px 18px;font-size:10px;letter-spacing:.16em}.nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 5vw;border-bottom:1px solid var(--line);background:rgba(245,241,234,.95)}.logo{font:700 22px Georgia,serif;letter-spacing:.18em;text-decoration:none;color:inherit}.links{display:flex;gap:28px;font-size:12px}.links a,.nav-cta{text-decoration:none;color:inherit}.nav-cta{border:1px solid var(--ink);padding:9px 14px;font-size:10px;letter-spacing:.06em}.hero{min-height:700px;display:grid;grid-template-columns:48% 52%;border-bottom:1px solid var(--line)}.hero-copy{padding:8vw 6vw 7vw 7vw;display:flex;flex-direction:column;justify-content:center}.eyebrow{font-size:10px;letter-spacing:.2em;font-weight:700;color:var(--accent);margin:0 0 17px}.hero h1,.section h2,.editorial h2,.contact h2{font-family:Georgia,serif;font-weight:400;line-height:1.02;margin:0}.hero h1{font-size:clamp(52px,5.8vw,92px);letter-spacing:-.025em}.lead{font-size:15px;line-height:1.8;color:var(--muted);max-width:520px;margin:28px 0}.button{display:inline-flex;align-items:center;gap:15px;background:var(--dark);color:#fff;text-decoration:none;padding:14px 20px;font-size:10px;letter-spacing:.08em;width:max-content}.hero-art{position:relative;overflow:hidden;background:linear-gradient(145deg,#e7ded3,#bbaa98 53%,#8d7f70);display:grid;place-items:center}.hero-stage{width:72%;aspect-ratio:4/5;max-height:82%;border:1px solid rgba(255,255,255,.5);display:grid;place-items:center;position:relative;background:rgba(255,255,255,.04)}.bag{width:58%;height:34%;position:relative;filter:drop-shadow(0 28px 26px rgba(37,28,20,.2))}.bag-body{position:absolute;left:4%;right:4%;bottom:0;height:67%;background:#26221e;border-radius:7px 7px 26px 26px}.bag-handle{position:absolute;left:29%;top:2%;width:42%;height:48%;border:16px solid #26221e;border-bottom:0;border-radius:999px 999px 0 0}.bag-lock{position:absolute;left:47%;bottom:38%;width:7%;height:10%;border-radius:50%;background:#bc9960}.trust{display:grid;grid-template-columns:repeat(3,1fr);background:var(--paper);border-bottom:1px solid var(--line)}.trust>div{padding:24px 5vw;border-right:1px solid var(--line)}.trust>div:last-child{border-right:0}.trust b{display:block;font:400 17px Georgia,serif}.trust span{display:block;margin-top:6px;color:var(--muted);font-size:11px}.section{padding:95px 5vw}.section-head{display:flex;justify-content:space-between;align-items:end;gap:40px}.section h2,.editorial h2,.contact h2{font-size:clamp(40px,4.6vw,68px)}.section-intro{max-width:430px;color:var(--muted);font-size:13px;line-height:1.75}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:34px 0 28px}.filter{background:transparent;border:1px solid var(--line);padding:10px 14px;font-size:10px;letter-spacing:.06em}.filter.active{background:var(--dark);color:#fff;border-color:var(--dark)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.card{background:var(--paper);border:1px solid var(--line);position:relative}.product-img{aspect-ratio:3/4;background:linear-gradient(145deg,#ece5dc,#c7b8a8);display:grid;place-items:center;overflow:hidden}.mini-bag{width:56%;height:32%;background:#29241f;border-radius:5px 5px 18px 18px;position:relative;box-shadow:0 24px 34px rgba(34,26,20,.18)}.mini-bag:before{content:"";position:absolute;left:30%;top:-45%;width:40%;height:55%;border:10px solid #29241f;border-bottom:0;border-radius:999px 999px 0 0}.mini-bag.light{background:#e9e1d6;border:1px solid #a89b8e}.mini-bag.light:before{border-color:#e9e1d6}.mini-bag.brown{background:#5a4130}.mini-bag.brown:before{border-color:#5a4130}.card-copy{padding:16px}.card-copy h3{font:400 18px Georgia,serif;margin:0 0 7px}.meta{font-size:10px;color:var(--muted)}.price-note{margin-top:10px;font-size:10px;letter-spacing:.07em}.editorial{display:grid;grid-template-columns:1fr 1fr;background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.editorial-art{min-height:560px;background:linear-gradient(145deg,#2c2823,#554a40);display:grid;place-items:center}.editorial-art .bag{width:min(360px,56%);height:230px;transform:rotate(-6deg)}.editorial-copy{padding:9vw 7vw;display:flex;flex-direction:column;justify-content:center}.editorial-copy p:last-of-type{color:var(--muted);font-size:14px;line-height:1.85;max-width:530px;margin:24px 0}.contact{text-align:center;padding:110px 5vw}.contact p{max-width:620px;margin:20px auto 27px;color:var(--muted);font-size:14px;line-height:1.8}.contact-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.footer{background:var(--dark);color:#fff;padding:55px 5vw;display:flex;justify-content:space-between;align-items:end}.footer strong{font:400 clamp(36px,6vw,70px) Georgia,serif;letter-spacing:.12em}.footer small{color:#aaa39b}
      @media(max-width:900px){.links{display:none}.hero{grid-template-columns:1fr}.hero-copy{padding:78px 7vw 58px}.hero-art{min-height:520px}.trust{grid-template-columns:1fr}.trust>div{border-right:0;border-bottom:1px solid var(--line)}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.editorial{grid-template-columns:1fr}.editorial-art{min-height:420px}.section-head{display:block}.section-intro{margin-top:18px}.footer{flex-direction:column;align-items:flex-start;gap:24px}}
      @media(max-width:560px){.nav{height:64px;padding:0 18px}.nav-cta{display:none}.hero h1{font-size:49px}.hero-art{min-height:410px}.section{padding:72px 18px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card-copy{padding:11px}.card-copy h3{font-size:15px}.editorial-copy{padding:68px 22px}.contact{padding:82px 22px}.footer{padding:42px 22px}}
    `

    editor.setComponents(html)
    editor.setStyle(css)
    console.info('[JINHUAN] Seeded the Silex canvas with the luxury storefront layout.')
  })
}
