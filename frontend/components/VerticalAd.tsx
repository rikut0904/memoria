"use client";

import { useEffect, useRef } from "react";

type AdSenseWindow = Window & {
  adsbygoogle?: Array<Record<string, never>>;
};

export default function VerticalAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    const initializeAd = () => {
      if (initializedRef.current || container.getBoundingClientRect().width <= 0) {
        return;
      }

      initializedRef.current = true;
      const adsWindow = window as AdSenseWindow;
      (adsWindow.adsbygoogle = adsWindow.adsbygoogle || []).push({});
    };

    initializeAd();
    const observer = new ResizeObserver(initializeAd);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={adContainerRef} className="auth-ad">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6748867170638544"
        data-ad-slot="9125921528"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
