import React, { createContext, useContext, useEffect, useState } from 'react';
import { MERCH_PRODUCTS, type MerchProduct } from '../data/merchProducts';
import { supabase, errorMessage } from '../lib/supabase';
const CatalogContext=createContext<{products:MerchProduct[];comingSoon:boolean;loading:boolean;error:string;refresh:()=>Promise<void>}>({products:[],comingSoon:false,loading:true,error:'',refresh:async()=>{}});
export function CatalogProvider({children}:{children:React.ReactNode}){
 const [products,setProducts]=useState<MerchProduct[]>([]);const [comingSoon,setComingSoon]=useState(false);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 async function refresh(){
  if(!supabase){setError('The merchandise shop is awaiting setup.');setLoading(false);return;}
  try{const settings=await supabase.from('shop_settings').select('coming_soon,bank_name,account_name,account_number').eq('id',true).single();if(settings.error)throw settings.error;
   const paused=settings.data.coming_soon || !settings.data.bank_name.trim() || !settings.data.account_name.trim() || !settings.data.account_number.trim();
   setComingSoon(paused);if(paused){setProducts([]);setError('');return;}
   const catalog=await supabase.from('products').select('*,product_variants(*)').eq('is_active',true).order('name');if(catalog.error)throw catalog.error;
   const mapped=catalog.data.map(p=>{const original=MERCH_PRODUCTS.find(v=>v.id===p.id);const variants=p.product_variants as {size:string;price_minor:number}[];const prices=variants.map(v=>v.price_minor);const price=prices.length?Math.min(...prices)/100:0;return {...original,id:p.id,name:p.name,variant:p.variant_label,category:p.category,description:p.description,images:[p.image_url,...(original?.images.slice(1)||[])],options:{sizes:variants.map(v=>v.size).filter(Boolean)},priceLkr:price,priceDisplay:`LKR ${price.toLocaleString('en-LK')}`,isAvailable:variants.some(v=>v.price_minor>0),claimStatus:'OFFICIAL PRE-ORDER',claimEligibility:'Registered Catalyst delegates',pickupLocation:'Catalyst merchandise desk'} as MerchProduct;});setProducts(current=>JSON.stringify(current)===JSON.stringify(mapped)?current:mapped);setError('');
  }catch(e){setError(errorMessage(e));setProducts([]);}finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();const focus=()=>void refresh();window.addEventListener('focus',focus);const timer=window.setInterval(focus,10000);return()=>{window.removeEventListener('focus',focus);window.clearInterval(timer);};},[]);
 return <CatalogContext.Provider value={{products,comingSoon,loading,error,refresh}}>{children}</CatalogContext.Provider>;
}
export const useCatalog=()=>useContext(CatalogContext);
