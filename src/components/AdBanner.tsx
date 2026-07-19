'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

    // Instantly detect if AdSense marks the ad as unfilled or hides it via style attributes
    let observer: MutationObserver | null = null;
    if (adRef.current && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const status = adRef.current?.getAttribute('data-ad-status');
            const style = adRef.current?.getAttribute('style');
            if (status === 'unfilled' || (style && (style.includes('display: none') || style.includes('height: 0')))) {
              setIsCollapsed(true);
            }
          }
        });
      });

      observer.observe(adRef.current, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'style']
      });
    }

    // Collapse container if no ad loads (helps recover layout space when ad-blocker is active)
    const checkAdLoad = setTimeout(() => {
      if (adRef.current) {
        const hasIframe = adRef.current.getElementsByTagName('iframe').length > 0;
        const status = adRef.current.getAttribute('data-ad-status');
        if (!hasIframe && status !== 'filled') {
          setIsCollapsed(true);
        }
      }
    }, 2000);

    return () => {
      clearTimeout(checkAdLoad);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Reserve standard banner heights to avoid Cumulative Layout Shift (CLS)
  const reservedHeight = dataAdFormat === 'rectangle' ? '280px' : '90px';

  return (
    <div style={{ 
      display: isCollapsed ? 'none' : 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      margin: isCollapsed ? '0' : '20px 0', 
      width: '100%', 
      overflow: 'hidden',
      minHeight: isCollapsed ? '0' : reservedHeight,
      transition: 'min-height 0.3s ease, margin 0.3s ease'
    }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8766645415313410"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};
