"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./MobileMenu.module.css";

export function MobileMenu({ categories }: { categories: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className={styles.dropdown}>
          <nav className={styles.nav}>
            {categories.map((cat) => (
              <Link 
                key={cat} 
                href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}/`} 
                className={styles.navLink}
                onClick={() => setIsOpen(false)}
              >
                {cat}
              </Link>
            ))}
            <Link 
              href="/contact/" 
              className={styles.submitBtn}
              onClick={() => setIsOpen(false)}
            >
              Submit a Code
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
