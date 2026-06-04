import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import PostEditor from "../../components/PostEditor";

export default function NewPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(data) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/posts", {
      method: "POST",
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

  return (
    <>
      <Head><title>New Post | Admin</title></Head>
      <PostEditor
        initial={{}}
        onSave={handleSave}
        saving={saving}
        error={error}
        title="New Post"
      />
    </>
  );
}
