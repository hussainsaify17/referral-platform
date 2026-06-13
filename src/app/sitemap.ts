import { MetadataRoute } from 'next';
import { getAllReferrals, getCategories } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://referbenefits.co.in';

  // Get all dynamic data
  const referrals = await getAllReferrals();
  const categories = await getCategories();

  // Map dynamic referral pages
  const referralUrls = referrals.map((ref) => ({
    url: `${baseUrl}/${ref.slug}`,
    lastModified: new Date(ref.last_checked || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Map dynamic category pages
  const categoryUrls = categories.map((cat) => {
    // Find the most recently updated referral in this category
    const catReferrals = referrals.filter(r => r.category === cat);
    const latestUpdate = catReferrals.length > 0
      ? Math.max(...catReferrals.map(r => new Date(r.last_checked || Date.now()).getTime()))
      : Date.now();

    return {
      url: `${baseUrl}/category/${cat.toLowerCase()}`,
      lastModified: new Date(latestUpdate),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    };
  });

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...categoryUrls, ...referralUrls];
}
