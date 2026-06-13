import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default function BlogIndexRedirect() {
  // Static export will create a meta-refresh HTML file for this
  redirect('/');
}
