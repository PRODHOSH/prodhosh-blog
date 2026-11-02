import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CoverArt from "../../components/CoverArt";
import AdminShell from "../../components/admin/AdminShell";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { useToast } from "../../components/admin/Toast";
import { api } from "../../lib/client";
import { formatDate } from "../../lib/utils";
import styles from "../../styles/Admin.module.css";

function statusOf(p) {
  if (!p.published) return "draft";
  if (p.publishedAt && new Date(p.publishedAt) > new Date()) return "scheduled";
  return "published";
}

const FILTERS = [
  ["all", "All"],
  ["published", "Published"],
  ["draft", "Drafts"],
  ["scheduled", "Scheduled"],
];

export default function AdminDashboard() {
  const toast = useToast();
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/posts")
      .then(setPosts)
      .catch((e) => {
        setPosts([]);
        toast(e.message, "error");
      });
  }, [toast]);

  async function togglePublish(p) {
    try {
      const updated = await api(`/api/posts/${p.id}`, {
        method: "PUT",
        body: { ...p, content: (await api(`/api/posts/${p.id}`)).content, published: !p.published },
      });
      const { content, ...meta } = updated;
      setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...meta } : x)));
      toast(updated.published ? "Published" : "Moved to drafts");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/posts/${confirm.id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((x) => x.id !== confirm.id));
      toast("Post deleted");
    } catch (e) {
      toast(e.message, "error");
    }
    setBusy(false);
    setConfirm(null);
  }

  const counts = useMemo(() => {
    const c = { all: 0, published: 0, draft: 0, scheduled: 0 };
    (posts || []).forEach((p) => {
      c.all++;
      c[statusOf(p)]++;
    });
    return c;
  }, [posts]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts || []).filter(
      (p) =>
        (filter === "all" || statusOf(p) === filter) &&
        (!q || `${p.title} ${(p.tags || []).join(" ")} ${p.slug}`.toLowerCase().includes(q))
    );
  }, [posts, filter, query]);

  return (
    <AdminShell
      title="Posts"
      actions={
        <Link href="/admin/new" className={styles.btnPrimary}>
          + New post
        </Link>
      }
    >
      <div className={styles.stats}>
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`${styles.stat} ${filter === key ? styles.statActive : ""}`} onClick={() => setFilter(key)}>
            <span className={styles.statNum}>{posts ? counts[key] : "–"}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, tag or slug…"
          className={styles.input}
          aria-label="Search posts"
        />
      </div>

      {posts === null ? (
        <p className={styles.muted}>Loading…</p>
      ) : shown.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{posts.length === 0 ? "No posts yet." : "Nothing matches your filter."}</p>
          {posts.length === 0 && (
            <Link href="/admin/new" className={styles.btnPrimary}>
              Write your first post
            </Link>
          )}
        </div>
      ) : (
        <ul className={styles.postList}>
          {shown.map((p) => {
            const st = statusOf(p);
            return (
              <li key={p.id} className={styles.postRow}>
                <div className={styles.rowThumb}>
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" loading="lazy" />
                  ) : (
                    <CoverArt seed={p.slug} />
                  )}
                </div>
                <div className={styles.rowMain}>
                  <Link href={`/admin/edit/${p.id}`} className={styles.rowTitle}>
                    {p.title}
                  </Link>
                  <div className={styles.rowMeta}>
                    <span className={`${styles.badge} ${styles[`badge_${st}`]}`}>{st}</span>
                    {p.featured && <span className={`${styles.badge} ${styles.badge_featured}`}>featured</span>}
                    <span>{formatDate(p.publishedAt || p.createdAt, { year: "numeric", month: "short", day: "numeric" })}</span>
                    <span>{p.wordCount} words</span>
                    {(p.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <Link href={`/admin/edit/${p.id}`} className={styles.btn}>
                    Edit
                  </Link>
                  {st !== "draft" && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className={styles.btn}>
                      View ↗
                    </a>
                  )}
                  <button className={styles.btn} onClick={() => togglePublish(p)}>
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <button className={styles.btnGhostDanger} onClick={() => setConfirm(p)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete this post?"
          body={`"${confirm.title}" will be permanently removed. This can't be undone.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AdminShell>
  );
}
