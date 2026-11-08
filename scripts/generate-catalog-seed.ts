import { writeFileSync } from 'node:fs';
import { MERCH_PRODUCTS } from '../src/data/merchProducts';
const q = (value: string) => `'${value.replaceAll("'", "''")}'`;
let sql = '-- Catalog snapshot from src/data/merchProducts.ts. Confirm commercial details before launch.\n-- No stock is invented. Admin must enter actual stock before orders can be placed.\nbegin;\n';
for (const p of MERCH_PRODUCTS) {
  sql += `insert into public.products(id,name,variant_label,category,description,image_url,is_active) values(${[p.id,p.name,p.variant,p.category,p.description,p.images[0]].map(q).join(',')},${p.isAvailable}) on conflict(id) do nothing;\n`;
  for (const size of p.options?.sizes || ['']) {
    const sku = `${p.id}-${size || 'default'}`;
    sql += `insert into public.product_variants(product_id,sku,size,price_minor) values(${q(p.id)},${q(sku)},${q(size)},${Math.round(p.priceLkr * 100)}) on conflict(sku) do nothing;\n`;
  }
}
sql += 'commit;\n';
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
