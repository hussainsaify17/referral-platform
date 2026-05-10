import { MetadataRoute } from 'next';
import { getAllReferrals, getCategories } from '@/lib/cms';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://referbenefits.co.in';

  // Get all dynamic data
  const referrals = await getAllReferrals();
  const categories = await getCategories();

  // Get blogs metadata
  let blogs: { slug: string; lastGenerated: number }[] = [];
  try {
    const metadataPath = path.join(process.cwd(), 'src/content/blogs/metadata.json');
    const metaStr = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metaStr);
    blogs = Object.entries(metadata).map(([slug, data]: [string, any]) => ({
      slug,
      lastGenerated: data.lastGenerated,
    }));
  } catch (e) {
    console.warn("Could not read blogs metadata for sitemap", e);
  }

  // Map dynamic referral pages
  const referralUrls = referrals.map((ref) => ({
    url: `${baseUrl}/${ref.slug}`,
    lastModified: new Date(ref.last_checked),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Map dynamic category pages
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Map blog pages
  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.lastGenerated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

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

  return [...staticRoutes, ...categoryUrls, ...blogUrls, ...referralUrls];
}
