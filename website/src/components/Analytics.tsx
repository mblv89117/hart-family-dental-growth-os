import Script from "next/script";

/**
 * Analytics architecture — loads vendors only when env IDs are present.
 * Do not hardcode tracking IDs. Prepare dataLayer + gtag event surface for:
 * GTM, GA4, Microsoft Clarity, Meta Pixel, Google Ads / Enhanced Conversions, CallRail.
 */
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const gtm = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID?.trim();
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const ads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
  const callrail = process.env.NEXT_PUBLIC_CALLRAIL_SWAP_SCRIPT_URL?.trim();

  return (
    <>
      <Script id="hfd-datalayer-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        window.hfdTrack = window.hfdTrack || function hfdTrack(event, params) {
          window.dataLayer.push(Object.assign({ event: event }, params || {}));
          if (typeof window.gtag === 'function') {
            window.gtag('event', event, params || {});
          }
        };
      `}</Script>

      {gtm ? (
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtm}');
        `}</Script>
      ) : null}

      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${ga}', { send_page_view: true });
            ${ads ? `gtag('config', '${ads}');` : ""}
          `}</Script>
        </>
      ) : null}

      {clarity ? (
        <Script id="ms-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarity}");
        `}</Script>
      ) : null}

      {meta ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${meta}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}

      {callrail ? <Script src={callrail} strategy="afterInteractive" /> : null}

      {/* noscript GTM iframe when GTM is configured */}
      {gtm ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      ) : null}
    </>
  );
}
