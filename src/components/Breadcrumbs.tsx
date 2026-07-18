import Link from "next/link";
import styles from "./Breadcrumbs.module.css";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const element: any = {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
      };
      if (item.href) {
        element.item = `https://referbenefits.co.in${item.href === '/' ? '' : item.href}`;
      }
      return element;
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={styles.nav}>
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href || `breadcrumb-${index}`} className={styles.item}>
                {isLast || !item.href ? (
                  <span className={isLast ? styles.current : styles.link} aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                )}
                {!isLast && <ChevronRight className={styles.separator} size={14} />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
