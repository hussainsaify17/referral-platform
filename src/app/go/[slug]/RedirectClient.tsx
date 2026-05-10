"use client";

import { useEffect } from "react";
import { trackClaimOffer } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";

interface Props {
  url: string;
  brandName: string;
  slug: string;
  category: string;
}

export default function RedirectClient({ url, brandName, slug, category }: Props) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get optional UTM source from the URL to track where this click came from
    const source = searchParams?.get('utm_source') || undefined;

    // Track the analytics event
    trackClaimOffer(brandName, slug, category, source);
    
    // Redirect after a tiny delay to ensure the gtag script has time to fire
    const timeout = setTimeout(() => {
      window.location.replace(url);
    }, 400);

    return () => clearTimeout(timeout);
  }, [url, brandName, slug, category, searchParams]);

  return null;
}
