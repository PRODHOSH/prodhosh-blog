import { useEffect, useState } from "react";
import styles from "../../styles/Post.module.css";

const enc = encodeURIComponent;

export default function ShareBar({ url, title, label = "Share this post" }) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}&via=prodhosh3` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}` },
  ];

  return (
    <div className={styles.share}>
      <span className="eyebrow">{label}</span>
      <div className={styles.shareBtns}>
        {canNative && (
          <button className="chip" onClick={() => navigator.share({ title, url }).catch(() => {})}>
            Share…
          </button>
        )}
        <button className="chip" onClick={copy} aria-live="polite">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        {links.map((l) => (
          <a key={l.name} className="chip" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.name}
          </a>
        ))}
      </div>
    </div>
  );
}
