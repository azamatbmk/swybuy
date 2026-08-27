'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const COUNTER_ID = Number(
  process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ||
    (process.env.NODE_ENV === 'development' ? 0 : 112012169),
);

function enabled(pathname: string) {
  return (
    Number.isInteger(COUNTER_ID) &&
    COUNTER_ID > 0 &&
    !pathname.startsWith('/admin')
  );
}

export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipInitHit = useRef(true);

  useEffect(() => {
    if (!enabled(pathname)) {
      return;
    }
    if (skipInitHit.current) {
      skipInitHit.current = false;
      return;
    }
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    const send = () => {
      if (typeof window.ym !== 'function') {
        return false;
      }
      window.ym(COUNTER_ID, 'hit', url);
      return true;
    };
    if (send()) {
      return;
    }
    const timer = window.setInterval(() => {
      if (send()) {
        window.clearInterval(timer);
      }
    }, 100);
    const stop = window.setTimeout(() => window.clearInterval(timer), 8000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [pathname, searchParams]);

  if (!enabled(pathname)) {
    return null;
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}', 'ym');
ym(${COUNTER_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
