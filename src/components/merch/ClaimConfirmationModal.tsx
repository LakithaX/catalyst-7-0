import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import EmailSignIn, { useSession } from '../EmailSignIn';
import { useMerch } from '../../context/MerchContext';
import { useCatalog } from '../../context/CatalogContext';
import { requireSupabase, errorMessage } from '../../lib/supabase';
import { quoteOrder, placePreorder, type OrderQuote } from '../../lib/booking';

type Delegate = {full_name:string;personal_email:string;reference:string;status:string};
export function ClaimConfirmationModal(){
 const {isClaimModalOpen,closeClaimModal,cartItems,clearCart}=useMerch();
 const {session}=useSession();
 const {comingSoon}=useCatalog();
 const [delegate,setDelegate]=useState<Delegate|null>(null);
 const [quote,setQuote]=useState<OrderQuote|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [reference,setReference]=useState('');
 const orderKey=useRef(crypto.randomUUID());
 const inFlight=useRef(false);
 useEffect(()=>{
   if(!isClaimModalOpen||reference)return;
   let active=true;setQuote(null);setDelegate(null);setError('');
   if(!session){setLoading(false);return;}
   setLoading(true);
   async function prepare(){try{
     const {data,error}=await requireSupabase().from('registrations').select('full_name,personal_email,reference,status').eq('user_id',session!.user.id).maybeSingle();
     if(error)throw error;
     if(!data||!['pending','approved'].includes(data.status))throw new Error('Complete an active Catalyst registration before pre-ordering.');
     const price=await quoteOrder(cartItems);
     if(active){setDelegate(data);setQuote(price);}
   }catch(e){if(active)setError(errorMessage(e));}finally{if(active)setLoading(false);}}
   void prepare();return()=>{active=false;};
 },[isClaimModalOpen,session?.user.id,cartItems,reference]);
 function close(){if(inFlight.current)return;closeClaimModal();if(reference){orderKey.current=crypto.randomUUID();setReference('');}setError('');}
 async function submit(e:React.FormEvent){
   e.preventDefault();if(inFlight.current||!session||!delegate||!quote||comingSoon)return;
   inFlight.current=true;setBusy(true);setError('');
   try{const order=await placePreorder(orderKey.current,quote);setReference(order.reference);clearCart();}
   catch(e){setError(errorMessage(e));}
   finally{inFlight.current=false;setBusy(false);}
 }
 return <Dialog.Root open={isClaimModalOpen&&(!comingSoon||Boolean(reference))} onOpenChange={open=>{if(!open)close();}}>
   <Dialog.Portal><Dialog.Backdrop className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"/>
   <div className="fixed inset-0 z-[71] flex items-center justify-center p-3 sm:p-5" onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <Dialog.Popup className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-[26px] border border-[#E5DDD0] bg-[#FAF6EE] p-5 text-[#252321] shadow-2xl outline-none sm:p-8">
     <Dialog.Close disabled={busy} aria-label="Close pre-order" className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-[#eee4d5] text-[#736b63] disabled:opacity-40"><X size={18}/></Dialog.Close>
     <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#C9362B]">Catalyst merchandise</p>
     <Dialog.Title className="pr-9 font-serif text-3xl font-bold">{reference?'Pre-order received.':'Your pre-order.'}</Dialog.Title>
     <Dialog.Description className="mt-3 text-sm leading-7 text-[#736b63]">{reference?'Your order is saved and linked to your delegate registration. Payment will be arranged later.':'Review your items and confirm your pre-order. No payment or receipt is needed now.'}</Dialog.Description>
     {reference?<div className="mt-6 space-y-5"><CheckCircle2 className="text-[#6e8b60]" size={36}/><div className="rounded-2xl border border-[#dfd2c0] bg-white/50 p-4"><p className="mb-2 text-[10px] uppercase tracking-widest text-[#736b63]">Order reference</p><p className="break-all font-mono text-sm font-semibold">{reference}</p><p className="mt-3 text-xs text-[#736b63]">Payment status: unpaid · Instructions will be provided later.</p></div><button onClick={close} className="min-h-12 w-full rounded-full bg-[#c9362b] px-5 py-3 text-sm font-semibold text-white">Done</button></div>:<>
       <EmailSignIn />
       {loading&&<p role="status" className="my-4 flex items-center gap-2 text-sm"><Loader2 className="animate-spin" size={16}/>Checking your registration and current prices…</p>}
       {error&&<p role="alert" className="my-4 rounded-xl border border-[#c9362b]/20 bg-[#c9362b]/5 p-3 text-sm leading-6 text-[#9e2722]">{error}</p>}
       {session&&!loading&&!delegate&&<Link to="/register" onClick={close} className="my-4 inline-flex min-h-11 items-center text-sm text-[#9e2722] underline">Register for Catalyst</Link>}
       {delegate&&<div className="my-5 rounded-2xl border border-[#e5ddd0] bg-white/50 p-4 text-sm"><strong>{delegate.full_name}</strong><p className="mt-1 break-all text-xs text-[#736b63]">{delegate.personal_email}</p><p className="mt-2 break-all font-mono text-[10px] text-[#736b63]">{delegate.reference}</p></div>}
       <form onSubmit={submit}><ul className="my-5 max-h-52 space-y-3 overflow-y-auto">{cartItems.map(item=><li key={item.cartId} className="flex min-w-0 items-center gap-3"><img src={item.image} alt="" className="size-12 shrink-0 rounded-xl border border-[#e5ddd0] bg-white object-contain p-1"/><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{item.name}</p><p className="text-[10px] text-[#736b63]">{item.variant}{item.size?` · ${item.size}`:''}</p></div><span className="shrink-0 text-xs">×{item.quantity}</span></li>)}</ul>
       {quote&&<div className="my-5 flex items-center justify-between gap-4 border-t border-[#e5ddd0] pt-4"><span className="text-sm">Pre-order total</span><strong className="text-xl text-[#c9362b]">LKR {(quote.totalMinor/100).toLocaleString('en-LK')}</strong></div>}
       <button disabled={busy||loading||!session||!delegate||!quote||comingSoon} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c9362b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?<Loader2 size={17} className="animate-spin"/>:<ArrowRight size={17}/>} {busy?'Saving pre-order…':'Confirm pre-order'}</button>
       <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] leading-5 text-[#99866f]"><ShieldCheck size={14} className="shrink-0"/>Linked to your verified registration. Pay later.</p></form>
     </>}
   </Dialog.Popup></div></Dialog.Portal>
 </Dialog.Root>;
}
