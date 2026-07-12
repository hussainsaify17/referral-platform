"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Layers, Award } from "lucide-react";
import styles from "./MobileMenu.module.css";

export function MobileMenu({ categories }: { categories: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={styles.container}>
      <button 
        className={styles.hamburger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Browse Categories</span>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className={styles.nav}>
              {categories.map((cat) => (
                <Link 
                  key={cat} 
                  href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}/`} 
                  className={styles.navLink}
                  onClick={() => setIsOpen(false)}
                >
                  <Layers size={16} className={styles.navIcon} />
                  <span>{cat}</span>
                  <ArrowRight size={14} className={styles.arrowIcon} />
                </Link>
              ))}
            </nav>

            <div className={styles.drawerFooter}>
              <Link 
                href="/contact/" 
                className={styles.submitBtn}
                onClick={() => setIsOpen(false)}
              >
                <Award size={16} />
                Submit a Code
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
