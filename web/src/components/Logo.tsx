import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg?v=2" alt="" className="h-9 w-9" />
      <span className="flex flex-col">
        <span className="font-display text-[1.7rem] font-normal leading-none tracking-[0.1em] text-ink">
          SwyBuy
        </span>
        <span className="mt-[6px] text-[0.64rem] italic font-medium leading-none tracking-[0.2em] text-lavender-deep">
          see what you buy
        </span>
      </span>
    </Link>
  );
}
