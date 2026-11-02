import { useEffect, useRef } from "react";
import styles from "../../styles/Post.module.css";

// Thin orange bar that tracks how far through the article you are.
export default function ReadingProgress({ targetId = "article-body" }) {
  const bar = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.getElementById(targetId);
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      bar.current.style.transform = `scaleX(${total > 0 ? done / total : 1})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return <div ref={bar} className={styles.progress} role="presentation" />;
}
