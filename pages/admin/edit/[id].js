import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PostEditor from "../../../components/PostEditor";
import { api } from "../../../lib/client";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api(`/api/posts/${id}`).then(setPost).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p style={{ padding: 40 }}>{error}</p>;
  if (!post) return <p style={{ padding: 40, color: "var(--mute)" }}>Loading…</p>;
  return <PostEditor key={post.id} initial={post} />;
}
