import { useCallback, useEffect, useRef, useState } from "react";
import { api, formatBytes, uploadImage } from "../../lib/client";
import { useToast } from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import styles from "../../styles/Admin.module.css";

/**
 * Upload + browse images. `onSelect` switches it into picker mode
 * (used by the editor for inline images and cover images).
 */
export default function MediaLibrary({ onSelect, selectLabel = "Insert" }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState(false);
  const [active, setActive] = useState(null);
  const [alt, setAlt] = useState("");
  const [confirm, setConfirm] = useState(null);
  const input = useRef(null);

  const load = useCallback(() => {
    api("/api/media")
      .then(setItems)
      .catch((e) => {
        setItems([]);
        toast(e.message, "error");
      });
  }, [toast]);

  useEffect(load, [load]);

  async function handleFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return toast("Choose image files (JPG, PNG, WebP or GIF).", "error");
    setBusy((b) => b + files.length);
    for (const f of files) {
      try {
        const m = await uploadImage(f);
        setItems((prev) => [m, ...(prev || [])]);
        setActive(m);
        setAlt("");
      } catch (e) {
        toast(`${f.name}: ${e.message}`, "error");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  async function remove(m) {
    try {
      await api(`/api/media/${m.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      if (active?.id === m.id) setActive(null);
      toast("Image deleted");
    } catch (e) {
      toast(e.message, "error");
    }
    setConfirm(null);
  }

  const copy = (text, msg) => navigator.clipboard.writeText(text).then(() => toast(msg)).catch(() => toast("Copy failed", "error"));
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const defaultAlt = (m) => m.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return (
    <div className={styles.media}>
      <div
        className={`${styles.drop} ${drag ? styles.dropActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p>
          <strong>Drop images here</strong> or{" "}
          <button type="button" className={styles.linkBtn} onClick={() => input.current?.click()}>
            browse
          </button>
        </p>
        <small>JPG, PNG, WebP, GIF · auto-resized to 1800px &amp; compressed</small>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        {busy > 0 && <span className={styles.uploading}>Uploading {busy}…</span>}
      </div>

      <div className={styles.mediaLayout}>
        <div className={styles.mediaGrid}>
          {items === null && <p className={styles.muted}>Loading…</p>}
          {items?.length === 0 && <p className={styles.muted}>No images yet. Upload your first one above.</p>}
          {items?.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.thumb} ${active?.id === m.id ? styles.thumbActive : ""}`}
              onClick={() => {
                setActive(m);
                setAlt("");
              }}
              onDoubleClick={() => onSelect?.(m, alt || defaultAlt(m))}
              title={m.filename}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt || m.filename} loading="lazy" />
            </button>
          ))}
        </div>

        {active && (
          <aside className={styles.mediaDetail}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt="" />
            <dl>
              <dt>File</dt>
              <dd>{active.filename}</dd>
              <dt>Size</dt>
              <dd>
                {active.width && active.height ? `${active.width}×${active.height} · ` : ""}
                {formatBytes(active.size)}
              </dd>
            </dl>
            {onSelect && (
              <label className={styles.field}>
                <span>Alt text (for accessibility &amp; SEO)</span>
                <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={defaultAlt(active)} className={styles.input} />
              </label>
            )}
            <div className={styles.detailActions}>
              {onSelect && (
                <button className={styles.btnPrimary} onClick={() => onSelect(active, alt || defaultAlt(active))}>
                  {selectLabel}
                </button>
              )}
              <button className={styles.btn} onClick={() => copy(`${origin}${active.url}`, "URL copied")}>
                Copy URL
              </button>
              <button className={styles.btn} onClick={() => copy(`![${alt || defaultAlt(active)}](${active.url})`, "Markdown copied")}>
                Copy markdown
              </button>
              <button className={styles.btnDanger} onClick={() => setConfirm(active)}>
                Delete
              </button>
            </div>
          </aside>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title="Delete this image?"
          body="Posts that use it will show a broken image. This can't be undone."
          onConfirm={() => remove(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
