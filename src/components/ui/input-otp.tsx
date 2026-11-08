import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { cn } from '@/lib/utils';
export const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(({className, containerClassName, ...props}, ref) => <OTPInput ref={ref} containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50',containerClassName)} className={cn('disabled:cursor-not-allowed',className)} {...props}/>);
InputOTP.displayName='InputOTP';
export function InputOTPSlot({index,className,...props}: React.ComponentProps<'div'> & {index:number}) {
 const context=React.useContext(OTPInputContext);
 const {char,hasFakeCaret,isActive}=context.slots[index];
 return <div className={cn('relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-[#dfd2c0] bg-[#f2eadd] text-lg text-[#252321]',isActive && 'ring-2 ring-[#c9362b] ring-offset-2',className)} {...props}>{char}{hasFakeCaret && <span className="absolute h-5 w-px animate-pulse bg-[#252321]"/>}</div>;
}
