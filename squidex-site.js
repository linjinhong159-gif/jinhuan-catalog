(() => {
  const cfg = window.JINHUAN_SQUIDEX || {};
  if (!cfg.enabled || !cfg.appName) return;

  const val = (field, locale = 'en') => {
    if (field == null) return '';
    if (typeof field !== 'object' || Array.isArray(field)) return field;
    if (field[locale] != null) return field[locale];
    if (field.iv != null) return field.iv;
    return Object.values(field).find(v => v != null) ?? '';
  };

  const setText = (id, value) => { const el = document.getElementById(id); if (el && value !== '' && value != null) el.textContent = value; };
  const setHtmlLines = (id, value) => { const el = document.getElementById(id); if (el && value) el.innerHTML = String(value).replace(/\n/g, '<br>'); };
  const bool = (field, fallback = true) => { const x = val(field, cfg.locale || 'en'); return x === '' || x == null ? fallback : Boolean(x); };

  async function loadSettings() {
    const schema = cfg.settingsSchema || 'site-settings';
    const endpoint = `https://cloud.squidex.io/api/content/${encodeURIComponent(cfg.appName)}/${encodeURIComponent(schema)}?take=1`;
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const payload = await response.json();
      const item = Array.isArray(payload.items) ? payload.items[0] : null;
      if (!item) return;
      const d = item.data || {}, locale = cfg.locale || 'en';

      const brand = val(d.brand, locale);
      if (brand) {
        document.querySelectorAll('[data-site-brand]').forEach(el => el.textContent = brand);
        document.title = `${brand} — Handbag Catalogue`;
      }
      setText('siteAnnouncement', val(d.announcement, locale));
      setText('siteNavCollection', val(d.navCollection, locale));
      setText('siteNavAbout', val(d.navAbout, locale));
      setText('siteNavContact', val(d.navContact, locale));
      setText('heroEyebrow', val(d.heroEyebrow, locale));
      setHtmlLines('heroTitle', val(d.heroTitle, locale));
      setText('heroText', val(d.heroText, locale));
      setText('heroButton', val(d.heroButton, locale));
      setText('benefit1Title', val(d.benefit1Title, locale)); setText('benefit1Text', val(d.benefit1Text, locale));
      setText('benefit2Title', val(d.benefit2Title, locale)); setText('benefit2Text', val(d.benefit2Text, locale));
      setText('benefit3Title', val(d.benefit3Title, locale)); setText('benefit3Text', val(d.benefit3Text, locale));
      setText('collectionEyebrow', val(d.collectionEyebrow, locale));
      setText('aboutEyebrow', val(d.aboutEyebrow, locale)); setText('aboutTitle', val(d.aboutTitle, locale)); setText('aboutText', val(d.aboutText, locale));
      setText('contactEyebrow', val(d.contactEyebrow, locale)); setText('contactTitle', val(d.contactTitle, locale)); setText('contactText', val(d.contactText, locale));
      setText('footerText', val(d.footerText, locale));

      const heroImage = val(d.heroImageUrl, locale);
      if (heroImage) {
        const visual = document.getElementById('heroVisual');
        if (visual) { visual.style.backgroundImage = `url("${String(heroImage).replace(/"/g, '%22')}")`; visual.classList.add('has-image'); }
      }

      const root = document.documentElement.style;
      const bg = val(d.backgroundColor, locale), accent = val(d.accentColor, locale), dark = val(d.darkColor, locale);
      if (bg) root.setProperty('--bg', bg); if (accent) root.setProperty('--gold', accent); if (dark) root.setProperty('--dark', dark);

      const benefits = document.getElementById('benefits'); if (benefits) benefits.style.display = bool(d.showBenefits, true) ? 'grid' : 'none';
      const about = document.getElementById('about'); if (about) about.style.display = bool(d.showAbout, true) ? 'grid' : 'none';
      const contact = document.getElementById('contact'); if (contact) contact.style.display = bool(d.showContact, true) ? 'block' : 'none';

      const email = val(d.email, locale), whatsapp = val(d.whatsapp, locale), telegram = val(d.telegram, locale);
      const links = document.getElementById('contactLinks');
      if (links) {
        const items = [];
        if (email) items.push(`<a href="mailto:${encodeURIComponent(email)}">Email</a>`);
        if (whatsapp) items.push(`<a href="https://wa.me/${String(whatsapp).replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp</a>`);
        if (telegram) items.push(`<a href="https://t.me/${String(telegram).replace(/^@/,'')}" target="_blank" rel="noopener">Telegram</a>`);
        links.innerHTML = items.join('');
      }
    } catch (e) { console.warn('Site settings fallback in use.', e); }
  }

  window.addEventListener('DOMContentLoaded', loadSettings);
})();
