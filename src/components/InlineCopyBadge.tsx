"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackCopyCode } from "@/lib/analytics";
import styles from "./InlineCopyBadge.module.css";

interface Props {
  code: string;
  brandName: string;
  slug: string;
}

export function InlineCopyBadge({ code, brandName, slug }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackCopyCode(code, brandName, slug);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy inline code", err);
    }
  };

  return (
    <span 
      className={`${styles.badge} ${copied ? styles.copied : ""}`} 
      onClick={handleCopy}
      title="Click to copy referral code"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Trigger the same copy logic
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            trackCopyCode(code, brandName, slug);
            setTimeout(() => setCopied(false), 1500);
          });
        }
      }}
    >
      <code className={styles.code}>{code}</code>
      <span className={styles.iconContainer}>
        {copied ? (
          <Check size={13} className={styles.iconCheck} />
        ) : (
          <Copy size={13} className={styles.iconCopy} />
        )}
      </span>
      {copied && <span className={styles.tooltip}>Copied!</span>}
    </span>
  );
}
