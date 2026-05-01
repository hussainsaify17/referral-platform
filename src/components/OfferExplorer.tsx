"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Referral } from "@/lib/types";
import { ReferralCard } from "@/components/ReferralCard";
import { CategoryNav } from "@/components/CategoryNav";
import styles from "./OfferExplorer.module.css";

interface Props {
  allReferrals: Referral[];
  initialReferrals: Referral[];
  categories: string[];
  featuredNode?: React.ReactNode;
}

export function OfferExplorer({ allReferrals, initialReferrals, categories, featuredNode }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => setSearchQuery("");

  const isSearching = searchQuery.trim().length > 0;

  // Filter against all referrals when searching
  const searchResults = isSearching 
    ? allReferrals.filter(ref => 
        ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.benefit_user.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : initialReferrals;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.navWrapper}>
          <CategoryNav categories={categories} />
        </div>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search offers (e.g. Swiggy, Cred)..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearch}
          />
          {isSearching && (
            <button onClick={clearSearch} className={styles.clearButton} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {!isSearching && featuredNode}

      <div className={styles.resultsContainer}>
        {!isSearching && <h2 className={styles.sectionTitle}>Latest Offers</h2>}
        {isSearching && (
          <h2 className={styles.sectionTitle}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </h2>
        )}

        {searchResults.length > 0 ? (
          <div className="bentoGrid">
            {searchResults.map((ref, index) => (
              <ReferralCard key={ref.id} referral={ref} position={index + 1} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No offers found for "{searchQuery}". Try searching for another app or category!</p>
            <button onClick={clearSearch} className={styles.resetBtn}>View all offers</button>
          </div>
        )}
      </div>
    </div>
  );
}
