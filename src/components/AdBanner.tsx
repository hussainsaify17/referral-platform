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
    <div style={{ margin: '20px 0', minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', border: '1px dashed #ccc', borderRadius: '8px' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Placeholder, replace with actual publisher ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
      {/* Fallback text when adblock is enabled or running on localhost */}
      <span style={{ position: 'absolute', color: '#999', fontSize: '14px', zIndex: -1 }}>Advertisement</span>
    </div>
  );
};
