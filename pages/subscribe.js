import { useState } from "react";
import SEO, { breadcrumbLd } from "../components/SEO";
import { socials } from "../components/socials";
import { SITE } from "../lib/site";
import styles from "../styles/Subscribe.module.css";

const FEED = `${SITE.url}/feed.xml`;
const enc = encodeURIComponent;

// One-click "add to reader" links. Each opens the reader with this blog pre-filled.
const readers = [
  { name: "Feedly", href: `https://feedly.com/i/subscription/feed/${enc(FEED)}` },
  { name: "Inoreader", href: `https://www.inoreader.com/?add_feed=${enc(FEED)}` },
  { name: "NetNewsWire", href: `feed:${FEED}` },
  { name: "Reeder / other apps", href: `feed:${FEED}` },
];

export default function Subscribe() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(FEED);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = FEED;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <SEO
        title="Subscribe"
        description={`Get new ${SITE.name} articles automatically. Follow with RSS in Feedly, Inoreader or any feed reader, or follow ${SITE.author.name} on social.`}
        keywords={["subscribe", "RSS feed", "follow blog", "Feedly", "Inoreader", ...SITE.keywords.slice(0, 4)]}
        path="/subscribe"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Subscribe", path: "/subscribe" },
          ]),
        ]}
      />

      <div className={`container ${styles.wrap}`}>
        <p className={styles.eyebrow}>Follow along</p>
        <h1 className={styles.title}>
          Get new posts <span className="serif">automatically.</span>
        </h1>
        <p className={styles.lede}>
          There&apos;s no newsletter to sign up for and no algorithm in the way. This blog has an RSS feed: add it to a
          feed reader once, and every new article shows up there on its own.
        </p>

        <section className={styles.card} aria-labelledby="url-h">
          <h2 id="url-h" className={styles.cardTitle}>
            1. Copy the feed link
          </h2>
          <div className={styles.urlRow}>
            <input readOnly value={FEED} className={styles.urlInput} aria-label="RSS feed URL" onFocus={(e) => e.target.select()} />
            <button className="main-button" onClick={copy} aria-live="polite">
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
          <p className={styles.hint}>Paste it into any feed reader&apos;s &ldquo;add feed&rdquo; box.</p>
        </section>

        <section className={styles.card} aria-labelledby="open-h">
          <h2 id="open-h" className={styles.cardTitle}>
            2. Or open it straight in a reader
          </h2>
          <div className={styles.readers}>
            {readers.map((r) => (
              <a key={r.name} href={r.href} className="ghost-button" {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {r.name}
              </a>
            ))}
          </div>
          <p className={styles.hint}>New to this? Feedly and Inoreader are free and work in the browser.</p>
        </section>

        <section className={styles.card} aria-labelledby="other-h">
          <h2 id="other-h" className={styles.cardTitle}>
            Prefer social?
          </h2>
          <div className={styles.socials}>
            {socials
              .filter((s) => s.name !== "Email")
              .map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label={s.name} title={s.name}>
                  {s.icon}
                  <span>{s.name}</span>
                </a>
              ))}
          </div>
        </section>

        <p className={styles.tech}>
          For developers: <a href="/feed.xml">RSS 2.0</a> · <a href="/feed.json">JSON Feed</a> · <a href="/llms.txt">llms.txt</a>
        </p>
      </div>
    </>
  );
}
