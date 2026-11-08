import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  QrCode,
  UploadCloud,
  FileText,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import EmailSignIn, { useSession } from '../EmailSignIn';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { requireSupabase, errorMessage } from '../../lib/supabase';
import { quoteOrder, placePreorder, type OrderQuote } from '../../lib/booking';
import { useMerch } from '../../context/MerchContext';

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const MAX_PICK_BYTES = 12 * 1024 * 1024; // biggest file we will even try to read
// ============================================================================

type Step = 1 | 2;
type Receipt = { blob: Blob; name: string; type: string; size: number; previewUrl: string | null };
type Errors = Partial<Record<'name' | 'email' | 'phone', string>>;


const formatKb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// shrink big phone photos / screenshots so they upload fast
const compressImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * scale));
      c.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = c.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });

const inputBase =
  'w-full rounded-lg border bg-white px-4 py-3 text-base text-[#252321] shadow-xs transition-colors placeholder:text-[#736B63]/60 focus:outline-none sm:text-sm';

const Field = ({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-widest text-[#736B63]">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#B51E23]">
        <AlertCircle size={13} aria-hidden="true" /> {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-[#736B63]">
        {hint}
      </p>
    ) : null}
  </div>
);

export const ClaimConfirmationModal: React.FC = () => {
  const { isClaimModalOpen, closeClaimModal, cartItems, clearCart } = useMerch();

  const [step, setStep] = useState<Step>(1);
  const orderKey = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const {session} = useSession();
  const {comingSoon} = useCatalog();
  const [quote,setQuote] = useState<OrderQuote|null>(null);
  const [delegateReady,setDelegateReady] = useState(false);
  const [BANK,setBank] = useState({bank:'',accountName:'',accountNumber:'',branch:''});
  const [reference, setReference] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [delegateId, setDelegateId] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const totalLkr = quote ? quote.totalMinor / 100 : 0;
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!isClaimModalOpen) return;
    let active=true;
    setQuote(null);setDelegateReady(false);setSubmitError('');setName('');setEmail('');setPhone('');setDelegateId('');setStep(1);
    async function prepare(){
      try {
        const db=requireSupabase();
        const bank=await db.from('shop_settings').select('bank_name,account_name,account_number,bank_branch').eq('id',true).single();
        if(bank.error)throw bank.error;
        if(active)setBank({bank:bank.data.bank_name,accountName:bank.data.account_name,accountNumber:bank.data.account_number,branch:bank.data.bank_branch});
        if(!session)return;
        const registration=await db.from('registrations').select('full_name,personal_email,phone,reference,status').eq('user_id',session.user.id).maybeSingle();
        if(registration.error)throw registration.error;
        if(!registration.data || !['pending','approved'].includes(registration.data.status))throw new Error('Complete an active Catalyst registration before pre-ordering.');
        const current=await quoteOrder(cartItems);
        if(active){setName(registration.data.full_name);setEmail(registration.data.personal_email);setPhone(registration.data.phone);setDelegateId(registration.data.reference);setDelegateReady(true);setQuote(current);}
      }catch(e){if(active)setSubmitError(errorMessage(e));}
    }
    void prepare();return()=>{active=false;};
  },[isClaimModalOpen,session?.user.id,cartItems]);

  // free the preview image when it is replaced / removed / the modal unmounts
  useEffect(() => {
    return () => {
      if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);
    };
  }, [receipt]);

  // lock page scroll while open
  useEffect(() => {
    if (!isClaimModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isClaimModalOpen]);

  const handleClose = () => {
    if (inFlight.current) return;
    const wasSuccess = isSuccess;
    closeClaimModal();
    window.setTimeout(() => {
      if (wasSuccess) {
        setIsSuccess(false);
        setStep(1);
        setName('');
        setEmail('');
        setPhone('');
        setDelegateId('');
        setReceipt(null);
        orderKey.current=crypto.randomUUID();setReference('');
      }
      setErrors({});
      setSubmitError('');
      setReceiptError('');
    }, 300);
  };

  // Esc closes
  useEffect(() => {
    if (!isClaimModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClaimModalOpen, submitting, isSuccess]);

  // scroll to the top of the dialog when the step changes
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [step, isSuccess]);

  // ---------------- step 1: details ----------------
  const validateDetails = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    const digits = phone.replace(/[^\d]/g, '');
    if (!/^[\d+\s()-]+$/.test(phone.trim()) || digits.length < 9 || digits.length > 15) {
      next.phone = 'Please enter a valid phone number, e.g. 077 123 4567.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !quote || !delegateReady || !session || comingSoon) return;
    if (!BANK.bank || !BANK.accountName || !BANK.accountNumber) {setSubmitError('Bank details have not been configured. Pre-orders will open once payment instructions are ready.');return;}
    if (validateDetails()) setStep(2);
  };

  // ---------------- step 2: receipt ----------------
  const acceptFile = async (file?: File) => {
    if (!file) return;
    setReceiptError('');
    const isPdf = file.type === 'application/pdf';
    const isImage = ['image/jpeg','image/png','image/webp'].includes(file.type);
    if (!isPdf && !isImage) {
      setReceiptError('Please upload a JPEG, PNG, WebP or PDF receipt.');
      return;
    }
    if (file.size > MAX_PICK_BYTES) {
      setReceiptError('That file is too large. Please choose one under 12 MB.');
      return;
    }

    setProcessing(true);
    try {
      let blob: Blob = file;
      let outName = file.name;
      let outType = file.type;

      if (isImage && (file.size > 500 * 1024 || file.type !== 'image/jpeg')) {
        try {
          blob = await compressImage(file);
          outType = 'image/jpeg';
          outName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        } catch {
          // could not decode it (for example some HEIC photos); fall back to the original if it is small enough
          blob = file;
        }
      }

      if (blob.size > MAX_RECEIPT_BYTES) {
        setReceiptError(
          isPdf
            ? 'That PDF is over 5 MB. Please upload a smaller one, or a screenshot of the receipt.'
            : 'We could not shrink that photo. Please take a screenshot of the receipt and upload that instead.'
        );
        return;
      }

      setReceipt({
        blob,
        name: outName,
        type: outType,
        size: blob.size,
        previewUrl: outType.startsWith('image/') ? URL.createObjectURL(blob) : null,
      });
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void acceptFile(e.dataTransfer.files?.[0]);
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      /* clipboard not available, ignore */
    }
  };

  const submitOrder = async () => {
    if (!receipt) {
      setReceiptError('Please upload your payment receipt to place the order.');
      return;
    }
    if(inFlight.current || !session || !quote || !delegateReady || comingSoon)return;
    inFlight.current=true;setSubmitting(true);setSubmitError('');
    try {
      const file=new File([receipt.blob],receipt.name,{type:receipt.type});
      const result=await placePreorder(orderKey.current,quote,file);
      setReference(result.reference);setIsSuccess(true);clearCart();
    } catch(error){setSubmitError(errorMessage(error));}
    finally{inFlight.current=false;setSubmitting(false);}
  };

  const steps: { n: Step; label: string }[] = [
    { n: 1, label: 'Your details' },
    { n: 2, label: 'Payment' },
  ];

  return (
    <AnimatePresence>
      {isClaimModalOpen && (!comingSoon || isSuccess) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-[#E5DDD0] bg-[#FAF6EE] p-5 text-[#252321] shadow-2xl sm:p-8"
          >
            {/* Corner Decorative Seal */}
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#C9362B]/10 to-transparent" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={submitting}
              className="absolute right-3 top-3 z-20 cursor-pointer rounded-full p-2.5 text-[#736B63] transition-colors hover:bg-[#252321]/5 hover:text-[#252321] disabled:opacity-40 sm:right-5 sm:top-5"
              aria-label="Close checkout"
            >
              <X size={20} />
            </button>

            {!isSuccess ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9362B]" />
                  <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B]">CHECKOUT</span>
                </div>

                <h3 className="brush-heading mb-4 font-['Jansina','Bison',sans-serif] text-3xl uppercase tracking-wider text-[#252321] sm:text-4xl">
                  {step === 1 ? 'YOUR DETAILS' : 'PAY & UPLOAD'}
                </h3>

                {/* Step indicator */}
                <ol className="mb-6 flex items-center gap-2" aria-label="Checkout steps">
                  {steps.map((s, idx) => {
                    const done = step > s.n;
                    const current = step === s.n;
                    return (
                      <React.Fragment key={s.n}>
                        <li className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                              done || current ? 'bg-[#C9362B] text-white' : 'bg-[#252321]/10 text-[#736B63]'
                            }`}
                          >
                            {done ? <Check size={13} /> : s.n}
                          </span>
                          <span className={`font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest ${current ? 'text-[#252321]' : 'text-[#736B63]'}`}>
                            {s.label}
                          </span>
                        </li>
                        {idx === 0 && <span className="h-px w-6 flex-1 bg-[#252321]/15 sm:w-10 sm:flex-none" aria-hidden="true" />}
                      </React.Fragment>
                    );
                  })}
                </ol>

                {cartItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-sm text-[#736B63]">Your cart is empty. Add something from the collection first.</p>
                    <button
                      onClick={handleClose}
                      className="cursor-pointer rounded-full border border-[#C9362B] px-6 py-2.5 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-[#C9362B] transition-colors hover:bg-[#C9362B]/5"
                    >
                      Back to collection
                    </button>
                  </div>
                ) : step === 1 ? (<>
                  {/* ======================= STEP 1 ======================= */}
                  <EmailSignIn />
                  {!delegateReady && session && <p className="mb-4 text-sm text-[#9e2722]">An active registration is required. <Link to="/register" onClick={handleClose} className="underline">Register for Catalyst</Link></p>}
                  {submitError && <p role="alert" className="mb-4 text-sm text-[#9e2722]">{submitError}</p>}
                  <form onSubmit={goToPayment} noValidate className="space-y-4">
                    <Field id="co-name" label="Full name" error={errors.name}>
                      <input
                        id="co-name"
                        type="text"
                        autoComplete="name"
                        autoFocus
                        placeholder="e.g. Kasun Perera"
                        readOnly value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'co-name-error' : undefined}
                        className={`${inputBase} ${errors.name ? 'border-[#B51E23]' : 'border-[#E5DDD0] focus:border-[#C9362B]'}`}
                      />
                    </Field>

                    <Field id="co-email" label="Email" error={errors.email} hint="Email from your verified registration.">
                      <input
                        id="co-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        readOnly value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'co-email-error' : 'co-email-hint'}
                        className={`${inputBase} ${errors.email ? 'border-[#B51E23]' : 'border-[#E5DDD0] focus:border-[#C9362B]'}`}
                      />
                    </Field>

                    <Field id="co-phone" label="Phone / WhatsApp" error={errors.phone} hint="So we can reach you about pick-up.">
                      <input
                        id="co-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="077 123 4567"
                        readOnly value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'co-phone-error' : 'co-phone-hint'}
                        className={`${inputBase} ${errors.phone ? 'border-[#B51E23]' : 'border-[#E5DDD0] focus:border-[#C9362B]'}`}
                      />
                    </Field>

                    <Field id="co-delegate" label="Delegate reference" hint="Linked automatically to your verified registration.">
                      <input
                        id="co-delegate"
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. SLIIT-DEL-2026"
                        readOnly value={delegateId}
                        onChange={(e) => setDelegateId(e.target.value)}
                        aria-describedby="co-delegate-hint"
                        className={`${inputBase} border-[#E5DDD0] focus:border-[#C9362B]`}
                      />
                    </Field>

                    {/* compact order summary */}
                    <div className="rounded-xl border border-[#E5DDD0] bg-white/80 p-3">
                      <p className="mb-2 font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#736B63]">
                        Your order · {totalQty} {totalQty === 1 ? 'item' : 'items'}
                      </p>
                      <ul className="max-h-36 space-y-2 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <li key={item.cartId} className="flex items-center gap-3 text-xs">
                            <img src={item.image} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-[#E5DDD0] bg-[#F8F3E9] object-contain p-1" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-['Jansina','Bison',sans-serif] text-sm font-bold tracking-wide">{item.name}</span>
                              <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-[#C9362B]">
                                {item.variant} {item.size ? `· SIZE ${item.size}` : ''}
                              </span>
                            </span>
                            <span className="font-mono text-[#736B63]">×{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between border-t border-[#252321]/10 pt-2">
                        <span className="font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-widest">Total</span>
                        <span className="font-['Jansina','Bison',sans-serif] text-xl tracking-wider text-[#C9362B]">LKR {totalLkr.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 cursor-pointer rounded-full border border-[#E5DDD0] bg-white px-4 py-3 font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-widest text-[#736B63] transition-colors hover:border-[#252321]/30 hover:text-[#252321]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!quote || !delegateReady || !session || submitting}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9362B] px-4 py-3 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all hover:bg-[#9E171C]"
                      >
                        <span>Continue</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </form>
                </>) : (
                  /* ======================= STEP 2 ======================= */
                  <div className="space-y-5">
                    {/* amount */}
                    <div className="flex items-center justify-between rounded-xl bg-[#252321] px-4 py-3 text-[#FAF6EE]">
                      <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#F6C768]">Amount to pay</span>
                      <span className="font-['Jansina','Bison',sans-serif] text-2xl tracking-wider">LKR {totalLkr.toLocaleString()}</span>
                    </div>

                    {/* bank details */}
                    <div className="rounded-xl border border-[#E5DDD0] bg-white p-4">
                      <p className="mb-3 font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#C9362B]">1 · Make a bank transfer</p>
                      <dl className="space-y-2.5 text-sm">
                        {[
                          ['Bank', BANK.bank],
                          ['Account name', BANK.accountName],
                          ['Account no.', BANK.accountNumber],
                          ['Branch', BANK.branch],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-3">
                            <dt className="text-xs text-[#736B63]">{k}</dt>
                            <dd className="flex items-center gap-2 font-semibold">
                              <span className={k === 'Account no.' ? 'font-mono tracking-wider' : ''}>{v}</span>
                              {k === 'Account no.' && (
                                <button
                                  type="button"
                                  onClick={() => copyText('acc', v)}
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#E5DDD0] text-[#736B63] transition-colors hover:border-[#C9362B] hover:text-[#C9362B]"
                                  aria-label="Copy account number"
                                >
                                  {copied === 'acc' ? <Check size={14} className="text-[#C9362B]" /> : <Copy size={14} />}
                                </button>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#F8F3E9] px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-[#736B63]">Use this as the payment reference</p>
                          <p className="font-mono text-sm font-bold tracking-wider text-[#C9362B]">{reference || `CAT7-PAY-${orderKey.current.toUpperCase()}`}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText('ref', reference || `CAT7-PAY-${orderKey.current.toUpperCase()}`)}
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#E5DDD0] bg-white text-[#736B63] transition-colors hover:border-[#C9362B] hover:text-[#C9362B]"
                          aria-label="Copy order reference"
                        >
                          {copied === 'ref' ? <Check size={15} className="text-[#C9362B]" /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* receipt upload */}
                    <div>
                      <p className="mb-2 font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#C9362B]">2 · Upload your payment receipt</p>

                      {!receipt ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                        >
                          <input
                            id="co-receipt"
                            type="file"
                            accept="image/*,application/pdf"
                            className="peer sr-only"
                            onChange={(e) => {
                              void acceptFile(e.target.files?.[0]);
                              e.target.value = '';
                            }}
                            aria-describedby="co-receipt-help"
                          />
                          <label
                            htmlFor="co-receipt"
                            className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#C9362B] peer-focus-visible:ring-offset-2 ${
                              dragging ? 'border-[#C9362B] bg-[#C9362B]/5' : receiptError ? 'border-[#B51E23] bg-white' : 'border-[#252321]/25 bg-white hover:border-[#C9362B]'
                            }`}
                          >
                            {processing ? (
                              <>
                                <Loader2 size={26} className="animate-spin text-[#C9362B]" aria-hidden="true" />
                                <span className="text-sm text-[#736B63]">Preparing your file…</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud size={28} className="text-[#C9362B]" aria-hidden="true" />
                                <span className="text-sm font-semibold">Tap to choose a file, or drop it here</span>
                                <span id="co-receipt-help" className="text-[11px] text-[#736B63]">
                                  Photo, screenshot or PDF of your bank receipt
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-[#E5DDD0] bg-white p-3">
                          {receipt.previewUrl ? (
                            <img src={receipt.previewUrl} alt="Your receipt" className="h-16 w-16 shrink-0 rounded-lg border border-[#E5DDD0] object-cover" />
                          ) : (
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E5DDD0] bg-[#F8F3E9] text-[#C9362B]">
                              <FileText size={26} aria-hidden="true" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{receipt.name}</p>
                            <p className="flex items-center gap-1 text-[11px] text-[#736B63]">
                              <Check size={12} className="text-[#C9362B]" aria-hidden="true" /> Ready to send · {formatKb(receipt.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReceipt(null);
                              setReceiptError('');
                            }}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#736B63] transition-colors hover:bg-[#B51E23]/10 hover:text-[#B51E23]"
                            aria-label="Remove receipt"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      )}

                      {receiptError && (
                        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#B51E23]">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> {receiptError}
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed text-[#736B63]">
                      Your receipt will be reviewed by the event team. Payment is confirmed only after verification. Pick-up is at the Catalyst registration booth on event day.
                    </p>

                    {submitError && (
                      <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#B51E23]/30 bg-[#B51E23]/5 p-3 text-xs font-medium text-[#B51E23]">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {submitError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={submitting}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E5DDD0] bg-white px-4 py-3 font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-widest text-[#736B63] transition-colors hover:border-[#252321]/30 hover:text-[#252321] disabled:opacity-50"
                      >
                        <ArrowLeft size={14} />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={submitOrder}
                        disabled={submitting || processing || !quote || !delegateReady || !session || comingSoon}
                        className="flex flex-[1.4] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C9362B] px-4 py-3 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all hover:bg-[#9E171C] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                            <span>Sending…</span>
                          </>
                        ) : (
                          <span>Place order</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Success Confirmation */
              <div className="py-4 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#C9362B]/10 text-[#C9362B]">
                  <CheckCircle2 size={36} />
                </div>

                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9362B]" />
                  <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9362B]">ORDER RECEIVED</span>
                </div>

                <h3 className="brush-heading mb-2 font-['Jansina','Bison',sans-serif] text-4xl uppercase tracking-wider text-[#252321]">THANK YOU</h3>

                <p className="mb-6 font-['Droid_Serif',Georgia,serif] text-sm italic text-[#736B63]">
                  Thank you, <span className="font-semibold text-[#252321]">{name.trim()}</span>. We have your order and receipt. We will check the payment and email
                  <span className="font-semibold text-[#252321]"> {email.trim()}</span> once it is confirmed.
                </p>

                <div className="mb-6 rounded-xl border border-[#E5DDD0] bg-white p-5 text-left shadow-xs">
                  <div className="mb-3 flex items-center justify-between border-b border-[#252321]/10 pb-3">
                    <span className="font-['Montserrat',sans-serif] text-[10px] font-bold uppercase tracking-widest text-[#736B63]">Order Reference</span>
                    <span className="font-mono text-sm font-bold tracking-wider text-[#C9362B]">{reference}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg border border-[#E5DDD0] bg-[#F8F3E9] p-2">
                      <QrCode className="h-12 w-12 text-[#252321]" />
                    </div>
                    <div className="space-y-1 text-xs text-[#736B63]">
                      <p className="font-semibold text-[#252321]">SLIIT Main Auditorium</p>
                      <p>Show this reference at the Catalyst registration booth on Day 1 to collect your order.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full cursor-pointer rounded-full bg-[#C9362B] px-6 py-3.5 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_16px_rgba(201,54,43,0.3)] transition-all hover:bg-[#9E171C]"
                >
                  Return to Collection
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};