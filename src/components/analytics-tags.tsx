"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4, GTM, and Clarity all detect client-side route changes on their own
// (GA4 enhanced measurement uses history events), so no manual page views.
export function AnalyticsTags({
  gtmId,
  gaId,
  clarityId,
}: {
  gtmId: string;
  gaId: string;
  clarityId: string;
}) {
  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}
      {gaId ? (
        <>
          <Script
            id="ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      ) : null}
      {clarityId ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`}
        </Script>
      ) : null}
    </>
  );
}

type Item = { id: string; name: string; price: number };

// Sends GA4 ecommerce events to GTM's dataLayer and, when set, straight to GA4.
export function AnalyticsEvent({
  event,
  value,
  items,
  gtm,
  ga,
}: {
  event: "view_item" | "begin_checkout";
  value: number;
  items: Item[];
  gtm: boolean;
  ga: boolean;
}) {
  const encoded = JSON.stringify(items);
  useEffect(() => {
    const ecommerce = {
      currency: "BDT",
      value,
      items: (JSON.parse(encoded) as Item[]).map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: 1,
      })),
    };
    if (gtm) {
      window.dataLayer = window.dataLayer || [];
      // Clear the previous ecommerce object, as Google recommends.
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({ event, ecommerce });
    }
    if (ga) {
      window.dataLayer = window.dataLayer || [];
      window.gtag ??= function () {
        // gtag reads the arguments object itself, not an array.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("event", event, ecommerce);
    }
  }, [encoded, event, value, gtm, ga]);

  return null;
}
