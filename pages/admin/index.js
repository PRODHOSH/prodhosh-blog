import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => { setAllPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(post) {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAllPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setAllPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const published = allPosts.filter((p) => p.published).length;
  const drafts = allPosts.length - published;

  return (
    <>
      <Head><title>Admin Dashboard | ProdhoshBlogs</title></Head>
      <div className={styles.adminLayout}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span className={styles.bracket}>&lt;</span>
            Admin
            <span className={styles.bracket}>/&gt;</span>
          </div>
          <nav className={styles.sidebarNav}>
            <span className={styles.sidebarLinkActive}>Posts</span>
            <Link href="/admin/new" className={styles.sidebarLink}>New Post</Link>
            <Link href="/" className={styles.sidebarLink} target="_blank">View Blog ↗</Link>
          </nav>
          <button onClick={logout} className={styles.logoutBtn}>Log out</button>
        </aside>

        {/* Main */}
        <main className={styles.adminMain}>
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.adminTitle}>Posts</h1>
              <p className={styles.adminSub}>
                {allPosts.length} total · {published} published · {drafts} draft{drafts !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/admin/new" className={styles.newPostBtn}>+ New Post</Link>
          </div>

          {loading ? (
            <div className={styles.loadingRow}>Loading…</div>
          ) : allPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No posts yet.</p>
              <Link href="/admin/new" className={styles.newPostBtn}>Write your first post</Link>
            </div>
          ) : (
            <div className={styles.postTable}>
              <div className={styles.tableHead}>
                <span>Title</span>
                <span>Tags</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {allPosts.map((post) => (
                <div key={post.id} className={styles.tableRow}>
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.postTags}>
                    {(post.tags || []).map((t) => (
                      <span key={t} className={styles.tagChip}>{t}</span>
                    ))}
                  </span>
                  <span>
                    <button
                      onClick={() => togglePublish(post)}
                      className={post.published ? styles.publishedBadge : styles.draftBadge}
                    >
                      {post.published ? "Published" : "Draft"}
                    </button>
                  </span>
                  <span className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className={styles.actions}>
                    <Link href={`/admin/edit/${post.id}`} className={styles.editBtn}>Edit</Link>
                    <button onClick={() => deletePost(post.id)} className={styles.deleteBtn}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
