import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/go/',
    },
    sitemap: 'https://referbenefits.co.in/sitemap.xml',
  };
}
