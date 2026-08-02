"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CategoryNav.module.css";

interface Props {
  categories: string[];
}

export function CategoryNav({ categories }: Props) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount),
      behavior: "smooth"
    });
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => scroll("left")}
        className={styles.scrollBtn}
        aria-label="Scroll left categories"
        type="button"
      >
        <ChevronLeft size={18} />
      </button>

      <nav
        aria-label="Referral categories"
        className={`${styles.scrollArea} hide-scrollbar`}
        ref={scrollRef}
      >
        <Link 
          href="/#offers" 
          className={`${styles.pill} ${pathname === '/' ? styles.active : ''}`} aria-current={pathname === '/' ? "page" : undefined}
        >
          All Offers
        </Link>
        {categories.map((cat) => {
          const href = `/category/${cat.toLowerCase().replace(/\s+/g, '-')}/`;
          const isActive = pathname === href || pathname === `${href}/`;
          return (
            <Link 
              key={cat} 
              href={`${href}#offers`} 
              className={`${styles.pill} ${isActive ? styles.active : ''}`}
            >
              {cat}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => scroll("right")}
        className={styles.scrollBtn}
        aria-label="Scroll right categories"
        type="button"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
