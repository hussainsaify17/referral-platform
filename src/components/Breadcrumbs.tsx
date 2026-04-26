import Link from "next/link";
import styles from "./Breadcrumbs.module.css";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://referbenefits.co.in${item.href === '/' ? '' : item.href}`,
    })),
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
              <li key={item.href} className={styles.item}>
                {isLast ? (
                  <span className={styles.current} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className={styles.link}>
                      {item.label}
                    </Link>
                    <ChevronRight className={styles.separator} size={14} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
