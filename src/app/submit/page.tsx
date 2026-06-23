import { getAllReferrals } from "@/lib/cms";
import { SubmitForm } from "./SubmitForm";
import styles from "./page.module.css";

// This is a Server Component that fetches data directly from the CMS
export default async function SubmitPage() {
  // Fetch all live referrals to get the list of active brand names
  const referrals = await getAllReferrals();
  
  // Extract unique brand names and sort them alphabetically
  const uniqueBrands = Array.from(new Set(referrals.map((r) => r.name))).sort();

  return (
    <main className={`container ${styles.container}`}>
      <SubmitForm brands={uniqueBrands} />
    </main>
  );
}
