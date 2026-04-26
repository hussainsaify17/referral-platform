"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import styles from "./CopyCodeButton.module.css";

interface Props {
  code: string;
}

export function CopyCodeButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.codeBox}>
        <span className={styles.label}>Referral Code:</span>
        <code className={styles.code}>{code}</code>
      </div>
      <button 
        className={`${styles.button} ${copied ? styles.copied : ""}`} 
        onClick={handleCopy}
        aria-label="Copy referral code"
      >
        {copied ? (
          <>
            <Check size={18} className={styles.icon} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={18} className={styles.icon} />
            Copy Code
          </>
        )}
      </button>
    </div>
  );
}
