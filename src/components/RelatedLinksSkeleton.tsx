import React from 'react';
import styles from './RelatedLinks.module.css';

export function RelatedLinksSkeleton() {
  // Render three skeleton lines mimicking link height
  return (
    <div className={styles.container} aria-hidden="true">
      <h3 className={styles.title}>Related Offers You Might Like</h3>
      <div className={styles.links}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeletonLine} />
        ))}
      </div>
    </div>
  );
}
