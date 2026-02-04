'use client'

import Script from 'next/script'

export default function VerticalAd() {
  return (
    <div className="auth-ad">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6748867170638544"
        data-ad-slot="9125921528"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script
        id="adsbygoogle-vertical"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      />
    </div>
  )
}
