import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PostEditor from "../../../components/PostEditor";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(setPost);
  }, [id]);

  async function handleSave(data) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const err = await res.json();
      setError(err.error || "Failed to save");
      setSaving(false);
    }
  }

  if (!post) {
    return <div style={{ padding: "60px", fontFamily: "sans-serif", color: "#655E7A" }}>Loading…</div>;
  }

  return (
    <>
      <Head><title>Edit: {post.title} | Admin</title></Head>
      <PostEditor
        initial={post}
        onSave={handleSave}
        saving={saving}
        error={error}
        title="Edit Post"
      />
    </>
  );
}
