import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
export default function ShopUnavailable(){
 const {loading,error,comingSoon,refresh}=useCatalog();
 return <section className="relative isolate flex min-h-[80svh] flex-col items-center justify-center overflow-hidden bg-[#f8f3e9] px-6 py-32 text-center text-[#252321]">
   <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-35 blur-xl"><div className="absolute inset-0 bg-[url('/assets/hero-section-assets/brush-strokes.webp')] bg-cover bg-center opacity-10"/><div className="absolute inset-x-0 top-1/3 mx-auto grid w-[130%] max-w-5xl -translate-x-[12%] grid-cols-3 gap-5 px-6">{[0,1,2].map(i=><div key={i} className="h-64 rounded-3xl border border-[#c4b39a] bg-[#e6dac8] sm:h-80"/>)}</div></div>
   <Sparkles className="mb-6 text-[#c9362b]"/><p className="mb-4 text-xs uppercase tracking-[.2em]">Catalyst merchandise</p>
   <h1 className="max-w-3xl font-serif text-4xl sm:text-6xl">{loading?'Preparing the collection…':comingSoon?'Something good is coming.':'The collection is being prepared.'}</h1>
   <p role="status" className="mt-5 max-w-md text-sm leading-7 text-[#736b63]">{loading?'Checking the latest availability.':comingSoon?'Our next drop is getting ready behind the scenes. The shop will open here once everything is set. Your existing pre-orders are safe.':error?'The shop is unavailable right now. Please try again shortly.':'Our collection will appear here once it is ready.'}</p>
   {error&&<button onClick={()=>void refresh()} className="mt-6 min-h-11 rounded-full border border-[#c9362b] px-6 py-3 text-sm text-[#c9362b]">Try again</button>}
   <Link to="/" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm"><ArrowLeft size={15}/>Back to Catalyst</Link>
 </section>;
}
