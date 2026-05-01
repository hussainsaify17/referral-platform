"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import styles from "./ShareButtons.module.css";

interface Props {
  url: string;
  title: string;
  text?: string;
}

export function ShareButtons({ url, title, text }: Props) {
  const [copied, setCopied] = useState(false);

  const fullText = text ? `${title} - ${text}` : title;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(fullText);

  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%0A${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Share2 size={16} /> Share this offer
      </h3>
      <div className={styles.buttons}>
        <a 
          href={links.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${styles.shareBtn} ${styles.whatsapp}`}
          title="Share on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
        <a 
          href={links.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${styles.shareBtn} ${styles.twitter}`}
          title="Share on X"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a 
          href={links.telegram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${styles.shareBtn} ${styles.telegram}`}
          title="Share on Telegram"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
        </a>
        <button 
          onClick={handleCopy} 
          className={`${styles.shareBtn} ${styles.copy}`}
          title="Copy Link"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
}
