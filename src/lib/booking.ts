import { requireSupabase } from './supabase';
import type { CartItem } from '../context/MerchContext';

export async function submitRegistration(key: string, answers: Record<string, string>, file: File) {
  const db = requireSupabase();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) throw new Error('Verify your email before submitting.');
  // Recover an already-committed request before uploading again after a lost response.
  const { data: existing, error: lookupError } = await db.from('registrations').select('id,reference').eq('user_id', user.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;
  const storageKey = `${user.id}/${key}/cv`;
  // A retry may find a file from the original upload. Never overwrite it.
  const { data: files, error: listError } = await db.storage.from('delegate-cvs').list(`${user.id}/${key}`);
  if (listError) throw listError;
  if (!files?.some(f => f.name === 'cv')) {
    const { error } = await db.storage.from('delegate-cvs').upload(storageKey, file, { contentType: file.type, upsert: false });
    if (error) throw error;
  }
  const { data, error } = await db.rpc('submit_registration', { p_key: key, p_answers: { ...answers, clan: 'SLIIT', 'clan-sp': null }, p_file: { storage_key: storageKey, original_name: file.name } });
  if (error) throw error;
  return data as { id: string; reference: string };
}

export type OrderQuote = { items: { variant_id: string; quantity: number }[]; totalMinor: number };
export async function quoteOrder(cart: CartItem[]): Promise<OrderQuote> {
  if (!cart.length) throw new Error('Your bag is empty.');
  const db = requireSupabase();
  const shop = await db.from('shop_settings').select('coming_soon').eq('id', true).single();
  if (shop.error) throw shop.error;
  if (shop.data.coming_soon) throw new Error('Merchandise is coming soon. Pre-orders are temporarily paused.');
  const { data, error } = await db.from('product_variants').select('id,product_id,size,price_minor,products!inner(is_active)').in('product_id', cart.map(i => i.productId));
  if (error) throw error;
  let totalMinor = 0;
  const items = cart.map(item => {
    const variant = data.find(v => v.product_id === item.productId && v.size === (item.size || ''));
    if (!variant || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error(`${item.name}: this selection is unavailable.`);
    totalMinor += variant.price_minor * item.quantity;
    return { variant_id: variant.id, quantity: item.quantity };
  });
  return { items, totalMinor };
}
export async function placePreorder(key: string, quote: OrderQuote, file: File) {
  const db = requireSupabase();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) throw new Error('Verify your registration email first.');
  if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type) || file.size < 1 || file.size > 5242880) throw new Error('Use a PDF, JPEG, PNG or WebP receipt up to 5 MB.');
  const previous = await db.from('orders').select('id,reference').eq('submission_key', key).maybeSingle();
  if (previous.error) throw previous.error;
  if (previous.data) return previous.data;
  const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
  const fileKey=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  const storageKey = `${user.id}/${key}/${fileKey}`;
  const existing = await db.storage.from('payment-receipts').list(`${user.id}/${key}`);
  if (existing.error) throw existing.error;
  if (!existing.data.some(f => f.name === fileKey)) {
    const upload = await db.storage.from('payment-receipts').upload(storageKey, file, {contentType:file.type, upsert:false});
    if (upload.error) throw upload.error;
  }
  const {data,error} = await db.rpc('place_preorder', {p_key:key,p_items:quote.items,p_total:quote.totalMinor,p_receipt:{storage_key:storageKey,original_name:file.name}});
  if (error) throw error;
  return data as {id:string;reference:string};
}
