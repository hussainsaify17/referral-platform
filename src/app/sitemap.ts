import { MetadataRoute } from 'next';
import { getAllReferrals, getCategories, getBlogPosts } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://referbenefits.co.in';

  // Get all dynamic data
  const referrals = await getAllReferrals();
  const categories = await getCategories();
  const blogPosts = await getBlogPosts();

  // Map dynamic referral pages — trailing slash to match trailingSlash: true in next.config.ts
  const referralUrls = referrals.map((ref) => ({
    url: `${baseUrl}/${ref.slug}/`,
    lastModified: new Date(ref.last_checked || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Map dynamic category pages — trailing slash
  const categoryUrls = categories.map((cat) => {
    // Find the most recently updated referral in this category
    const catReferrals = referrals.filter(r => r.category === cat);
    const latestUpdate = catReferrals.length > 0
      ? Math.max(...catReferrals.map(r => new Date(r.last_checked || Date.now()).getTime()))
      : Date.now();

    return {
      url: `${baseUrl}/category/${cat.toLowerCase().replace(/\s+/g, '-')}/`,
      lastModified: new Date(latestUpdate),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    };
  });

  // Map blog pages — trailing slash
  const blogUrls = [
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}/`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // Static routes — trailing slash
  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...categoryUrls, ...referralUrls, ...blogUrls];
}
