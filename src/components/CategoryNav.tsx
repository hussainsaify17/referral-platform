"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./CategoryNav.module.css";

interface Props {
  categories: string[];
}

export function CategoryNav({ categories }: Props) {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        <Link 
          href="/" 
          className={`${styles.pill} ${pathname === '/' ? styles.active : ''}`}
        >
          All Offers
        </Link>
        {categories.map((cat) => {
          const href = `/category/${cat.toLowerCase()}`;
          const isActive = pathname === href;
          return (
            <Link 
              key={cat} 
              href={href} 
              className={`${styles.pill} ${isActive ? styles.active : ''}`}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
