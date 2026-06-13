'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

export const AdBanner = ({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
}: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);
  
  useEffect(() => {
    try {
      // Check if window exists and if the ad hasn't been initialized yet
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        if (adRef.current && adRef.current.childElementCount === 0) {
           adsbygoogle.push({});
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div style={{ position: 'relative', margin: '20px 0', minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111111', border: '1px dashed #333333', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Fallback text when adblock is enabled or running on localhost */}
      <span style={{ position: 'absolute', color: '#444444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', position: 'relative', zIndex: 1 }}
        data-ad-client="ca-pub-8766645415313410"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};
