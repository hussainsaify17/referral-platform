"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import styles from "./CategoryNav.module.css";

interface Props {
  categories: string[];
}

export function CategoryNav({ categories }: Props) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // Track if actual drag occurred to prevent click
  const dragDistance = useRef(0);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    dragDistance.current = 0; // Reset
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
    dragDistance.current += Math.abs(walk);
  };

  // Prevent link click if we are actually dragging
  const handleLinkClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (dragDistance.current > 10) {
      e.preventDefault();
      dragDistance.current = 0;
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.scrollArea} hide-scrollbar`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Link 
          href="/#offers" 
          className={`${styles.pill} ${pathname === '/' ? styles.active : ''}`} aria-current={pathname === '/' ? "page" : undefined}
          onClick={handleLinkClick}
        >
          All Offers
        </Link>
        {categories.map((cat) => {
          const href = `/category/${cat.toLowerCase().replace(/\s+/g, '-')}`;
          const isActive = pathname === href || pathname === `${href}/`;
          return (
            <Link 
              key={cat} 
              href={`${href}#offers`} 
              className={`${styles.pill} ${isActive ? styles.active : ''}`}
              onClick={handleLinkClick}
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
