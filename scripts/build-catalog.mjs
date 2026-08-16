import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readDirJson = (dir) => {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ ...readJson(path.join(full, name)), __file: name }));
};

const products = readDirJson('content/products');
const categories = readDirJson('content/categories').sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
const pages = readDirJson('content/pages');
const storeSettings = readDirJson('content/store-settings');

let legacy = null;
const legacyPath = path.join(root, 'content/site.json');
if (fs.existsSync(legacyPath)) {
  try { legacy = readJson(legacyPath); } catch {}
}

const clean = (item) => {
  const out = { ...item };
  delete out.__file;
  return out;
};

const normalizedProducts = (products.length ? products : (legacy?.products || [])).map((p, index) => ({
  id: p.id || p.sku || `product-${index+1}`,
  name: p.name || 'Untitled product',
  sku: p.sku || p.id || `JH-${String(index+1).padStart(3,'0')}`,
  price: Number(p.price || 0),
  compare_price: p.compare_price === '' || p.compare_price == null ? null : Number(p.compare_price),
  currency: p.currency || storeSettings[0]?.currency || 'USD',
  category: p.category || '',
  status: p.status || 'active',
  featured: Boolean(p.featured),
  sort_order: Number(p.sort_order || 0),
  cover: p.cover || p.image || '',
  images: Array.isArray(p.images) ? p.images : [],
  size: p.size || '',
  material: p.material || '',
  color: p.color || '',
  description: p.description || ''
})).sort((a,b)=>(a.sort_order-b.sort_order)||a.name.localeCompare(b.name));

let home = pages.find((p) => p.slug === 'home') || pages[0] || null;
if (!home && legacy?.page?.content) {
  home = {
    title: 'Home',
    slug: 'home',
    legacy_content: legacy.page.content
  };
}

const settings = storeSettings[0] ? clean(storeSettings[0]) : (legacy?.settings || { brand:'JINHUAN', currency:'USD' });

const output = {
  version: 3,
  generatedAt: new Date().toISOString(),
  page: home ? clean(home) : { title:'Home', slug:'home', sections:[] },
  products: normalizedProducts,
  categories: categories.map(clean),
  settings
};

fs.writeFileSync(path.join(root, 'content/catalog.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Built content/catalog.json with ${output.products.length} products, ${output.categories.length} categories.`);
