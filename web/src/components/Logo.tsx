import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 md:gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg?v=2" alt="" className="h-8 w-8 md:h-9 md:w-9" />
      <span className="flex flex-col">
        <span className="font-display text-[1.05rem] font-normal leading-none tracking-[0.02em] text-ink md:text-[1.7rem] md:tracking-[0.1em]">
          SwyBuy
        </span>
        <span className="mt-[5px] hidden text-[0.64rem] font-medium italic leading-none tracking-[0.2em] text-lavender-deep md:block">
          see what you buy
        </span>
      </span>
    </Link>
  );
}
