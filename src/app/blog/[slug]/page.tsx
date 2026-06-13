import { redirect } from 'next/navigation';
import { getAllReferrals } from '@/lib/cms';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const referrals = await getAllReferrals();
  return referrals.map((r) => ({
    slug: r.slug,
  }));
}

export default async function BlogPostRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Static export will create a meta-refresh HTML file for each slug forwarding to the main offer page
  redirect(`/${slug}`);
}
