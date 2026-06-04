import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/Admin.module.css";

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function insertAround(ref, before, after = "", setValue) {
  const el = ref.current;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end);
  const next = el.value.substring(0, start) + before + selected + after + el.value.substring(end);
  setValue(next);
  setTimeout(() => {
    el.focus();
    el.selectionStart = start + before.length;
    el.selectionEnd = end + before.length;
  }, 0);
}

export default function PostEditor({ initial = {}, onSave, saving, error, title }) {
  const [postTitle, setPostTitle] = useState(initial.title || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [excerpt, setExcerpt] = useState(initial.excerpt || "");
  const [content, setContent] = useState(initial.content || "");
  const [tags, setTags] = useState((initial.tags || []).join(", "));
  const [published, setPublished] = useState(initial.published || false);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [slugEdited, setSlugEdited] = useState(!!initial.slug);
  const textareaRef = useRef(null);

  // Auto-slug from title
  useEffect(() => {
    if (!slugEdited && postTitle) setSlug(toSlug(postTitle));
  }, [postTitle, slugEdited]);

  // Render preview
  useEffect(() => {
    if (!preview || !content) return;
    import("marked").then(({ marked }) => {
      setPreviewHtml(marked.parse(content));
    });
  }, [preview, content]);

  function toolbar(before, after = "") {
    insertAround(textareaRef, before, after, setContent);
  }

  function handleSave(pub) {
    onSave({
      title: postTitle,
      slug,
      excerpt,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: pub ?? published,
    });
  }

  return (
    <div className={styles.editorLayout}>
      {/* Header bar */}
      <div className={styles.editorHeader}>
        <Link href="/admin" className={styles.editorBack}>← Dashboard</Link>
        <h1 className={styles.editorTitle}>{title}</h1>
        <div className={styles.editorActions}>
          {error && <span className={styles.editorError}>{error}</span>}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className={styles.draftBtn}
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className={styles.publishBtn}
          >
            {saving ? "Saving…" : published ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      <div className={styles.editorBody}>
        {/* Left: metadata */}
        <aside className={styles.metaPanel}>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Title</label>
            <input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className={styles.metaInput}
              placeholder="Post title"
            />
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Slug</label>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className={styles.metaInput}
              placeholder="post-url-slug"
            />
            <small className={styles.metaHint}>blog.prodhosh.me/blog/{slug || "slug"}</small>
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={styles.metaTextarea}
              placeholder="Short description for cards & SEO"
              rows={3}
            />
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaLabel}>Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={styles.metaInput}
              placeholder="react, nextjs, ai"
            />
            <small className={styles.metaHint}>Comma-separated</small>
          </div>
          <div className={styles.metaField}>
            <label className={styles.metaToggleRow}>
              <span className={styles.metaLabel}>Published</span>
              <button
                onClick={() => setPublished((p) => !p)}
                className={published ? styles.toggleOn : styles.toggleOff}
              >
                {published ? "Yes" : "No"}
              </button>
            </label>
          </div>
        </aside>

        {/* Right: editor / preview */}
        <div className={styles.editorPane}>
          <div className={styles.editorToolbar}>
            <button onClick={() => toolbar("**", "**")} title="Bold" className={styles.toolBtn}><b>B</b></button>
            <button onClick={() => toolbar("*", "*")} title="Italic" className={styles.toolBtn}><i>I</i></button>
            <button onClick={() => toolbar("`", "`")} title="Inline code" className={styles.toolBtn}>{"<>"}</button>
            <button onClick={() => toolbar("\n```\n", "\n```")} title="Code block" className={styles.toolBtn}>{"{ }"}</button>
            <button onClick={() => toolbar("## ")} title="Heading 2" className={styles.toolBtn}>H2</button>
            <button onClick={() => toolbar("### ")} title="Heading 3" className={styles.toolBtn}>H3</button>
            <button onClick={() => toolbar("- ")} title="List item" className={styles.toolBtn}>• List</button>
            <button onClick={() => toolbar("> ")} title="Blockquote" className={styles.toolBtn}>" Quote</button>
            <button onClick={() => toolbar("[", "](url)")} title="Link" className={styles.toolBtn}>🔗</button>
            <div className={styles.toolSep} />
            <button
              onClick={() => setPreview((p) => !p)}
              className={preview ? styles.toolBtnActive : styles.toolBtn}
            >
              {preview ? "✎ Edit" : "👁 Preview"}
            </button>
          </div>

          {preview ? (
            <div
              className={styles.previewPane}
              dangerouslySetInnerHTML={{ __html: previewHtml || "<em>Nothing to preview yet.</em>" }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.markdownTextarea}
              placeholder={`# Your post title\n\nStart writing in **Markdown**…`}
              spellCheck
            />
          )}
        </div>
      </div>
    </div>
  );
}
