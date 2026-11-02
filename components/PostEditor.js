import { useRouter } from "next/router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AdminShell from "./admin/AdminShell";
import ConfirmDialog from "./admin/ConfirmDialog";
import MediaLibrary from "./admin/MediaLibrary";
import { useToast } from "./admin/Toast";
import { api, uploadImage } from "../lib/client";
import { SITE, ogImageUrl } from "../lib/site";
import { slugify } from "../lib/utils";
import { describe, extractKeywords, markdownImages, wordCount } from "../lib/seo";
import styles from "../styles/Admin.module.css";

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

const blank = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: [],
  published: false,
  featured: false,
  coverImage: "",
  seoTitle: "",
  seoDescription: "",
  publishedAt: "",
};

function fromPost(p = {}) {
  return {
    ...blank,
    title: p.title || "",
    slug: p.slug || "",
    excerpt: p.excerpt || "",
    content: p.content || "",
    tags: p.tags || [],
    published: !!p.published,
    featured: !!p.featured,
    coverImage: p.coverImage || "",
    seoTitle: p.seoTitle || "",
    seoDescription: p.seoDescription || "",
    publishedAt: toLocalInput(p.publishedAt),
  };
}

export default function PostEditor({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial;
  const [id, setId] = useState(initial?.id ?? null);

  const [form, setForm] = useState(() => fromPost(initial));
  const saved = useRef(JSON.stringify(fromPost(initial)));
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [view, setView] = useState("write"); // write | split | preview
  const [panel, setPanel] = useState(false); // settings drawer on small screens
  const [picker, setPicker] = useState(null); // "inline" | "cover" | null
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [preview, setPreview] = useState({ html: "", words: 0, readingTime: "" });
  const [tagInput, setTagInput] = useState("");
  const [knownTags, setKnownTags] = useState([]);
  const [restorable, setRestorable] = useState(null);
  const area = useRef(null);
  const pendingSel = useRef(null);
  const bypassGuard = useRef(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== saved.current;
  const draftKey = `post-draft:${id ?? "new"}`;

  // ── Existing tags for suggestions ──
  useEffect(() => {
    api("/api/posts")
      .then((all) => setKnownTags([...new Set(all.flatMap((p) => p.tags || []))].sort()))
      .catch(() => {});
  }, []);

  // ── Local draft safety net ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (JSON.stringify(d.form) !== saved.current) setRestorable(d);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ form, at: Date.now() }));
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, [form, dirty, draftKey]);

  // ── Warn before losing unsaved work ──
  useEffect(() => {
    const onUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onRoute = () => {
      if (bypassGuard.current) return;
      if (dirty && !window.confirm("You have unsaved changes. Leave anyway?")) {
        router.events.emit("routeChangeError");
        // eslint-disable-next-line no-throw-literal
        throw "Route change aborted";
      }
    };
    window.addEventListener("beforeunload", onUnload);
    router.events.on("routeChangeStart", onRoute);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      router.events.off("routeChangeStart", onRoute);
    };
  }, [dirty, router.events]);

  // ── Auto-slug while the title is typed (new posts only) ──
  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  // ── Live preview using the same pipeline as the public site ──
  useEffect(() => {
    if (view === "write") return;
    const t = setTimeout(() => {
      api("/api/preview", { method: "POST", body: { content: form.content } })
        .then((r) => setPreview({ html: r.html, words: r.wordCount, readingTime: r.readingTime }))
        .catch(() => {});
    }, 450);
    return () => clearTimeout(t);
  }, [form.content, view]);

  const words = useMemo(() => (form.content.trim() ? form.content.trim().split(/\s+/).length : 0), [form.content]);

  // ── Save ──
  const save = useCallback(
    async (overridePublished) => {
      if (saving) return;
      const payload = {
        ...form,
        published: overridePublished ?? form.published,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };
      if (!payload.title.trim()) return toast("Add a title first.", "error");
      setSaving(true);
      try {
        const post = id
          ? await api(`/api/posts/${id}`, { method: "PUT", body: payload })
          : await api("/api/posts", { method: "POST", body: payload });
        const next = fromPost(post);
        saved.current = JSON.stringify(next);
        setForm(next);
        try {
          localStorage.removeItem(draftKey);
        } catch {}
        toast(payload.published ? "Saved & live" : "Draft saved");
        if (!id) {
          setId(post.id);
          // Move /admin/new → /admin/edit/:id so further saves update this post.
          bypassGuard.current = true;
          router.replace(`/admin/edit/${post.id}`);
        }
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setSaving(false);
      }
    },
    [form, id, saving, toast, draftKey, router]
  );

  // Ctrl/Cmd + S
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function remove() {
    try {
      await api(`/api/posts/${id}`, { method: "DELETE" });
      bypassGuard.current = true;
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      toast("Post deleted");
      router.push("/admin");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  // ── Markdown editing helpers (work on the textarea selection) ──
  useLayoutEffect(() => {
    if (pendingSel.current && area.current) {
      const [s, e] = pendingSel.current;
      area.current.focus();
      area.current.setSelectionRange(s, e);
      pendingSel.current = null;
    }
  });

  function edit(fn) {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const { text, from, to } = fn(value, s, e);
    pendingSel.current = [from, to];
    set({ content: text });
  }
  const wrap = (before, after = before, ph = "text") => () =>
    edit((v, s, e) => {
      const sel = v.slice(s, e) || ph;
      return { text: v.slice(0, s) + before + sel + after + v.slice(e), from: s + before.length, to: s + before.length + sel.length };
    });
  const linePrefix = (prefix) => () =>
    edit((v, s, e) => {
      const start = v.lastIndexOf("\n", s - 1) + 1;
      const block = v.slice(start, e).split("\n").map((l) => prefix + l).join("\n");
      return { text: v.slice(0, start) + block + v.slice(e), from: s + prefix.length, to: e + prefix.length * (block.split("\n").length) };
    });
  const insert = (snippet) =>
    edit((v, s, e) => ({ text: v.slice(0, s) + snippet + v.slice(e), from: s + snippet.length, to: s + snippet.length }));
  const codeBlock = () =>
    edit((v, s, e) => {
      const sel = v.slice(s, e) || "code here";
      const open = "\n```js\n";
      return { text: v.slice(0, s) + open + sel + "\n```\n" + v.slice(e), from: s + open.length, to: s + open.length + sel.length };
    });
  const link = () =>
    edit((v, s, e) => {
      const sel = v.slice(s, e) || "link text";
      return { text: v.slice(0, s) + `[${sel}](https://)` + v.slice(e), from: s + sel.length + 3, to: s + sel.length + 11 };
    });

  function onKeyDown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      wrap("**")();
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      wrap("*")();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      insert("  ");
    }
  }

  // ── Images: upload via paste / drop, or pick from the library ──
  async function uploadAndInsert(files) {
    const imgs = [...files].filter((f) => f.type.startsWith("image/"));
    for (const f of imgs) {
      toast(`Uploading ${f.name || "image"}…`);
      try {
        const m = await uploadImage(f);
        insert(`\n![${m.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}](${m.url})\n`);
      } catch (e) {
        toast(e.message, "error");
      }
    }
  }

  const onPaste = (e) => {
    const files = [...(e.clipboardData?.files || [])];
    if (files.some((f) => f.type.startsWith("image/"))) {
      e.preventDefault();
      uploadAndInsert(files);
    }
  };
  const onDrop = (e) => {
    if (e.dataTransfer?.files?.length) {
      e.preventDefault();
      uploadAndInsert(e.dataTransfer.files);
    }
  };

  // ── Tags ──
  function addTag(raw) {
    const t = raw.trim().replace(/,$/, "").slice(0, 30);
    if (!t) return;
    if (!form.tags.some((x) => x.toLowerCase() === t.toLowerCase()) && form.tags.length < 10) set({ tags: [...form.tags, t] });
    setTagInput("");
  }

  // ── SEO assistant: everything below is derived live from what you write ──
  const autoDesc = useMemo(() => describe(form.content, ""), [form.content]);
  const suggested = useMemo(
    () => extractKeywords({ title: form.title, tags: [], content: form.content, limit: 8 }).filter((k) => !form.tags.some((t) => t.toLowerCase() === k.toLowerCase())),
    [form.title, form.content, form.tags]
  );
  const seoTitle = form.seoTitle || form.title || "Post title";
  const seoDesc = form.seoDescription || form.excerpt || autoDesc || "Your meta description appears here.";
  const descLen = (form.seoDescription || form.excerpt || autoDesc).length;
  const titleLen = (form.seoTitle || form.title).length;
  const imgs = useMemo(() => markdownImages(form.content), [form.content]);
  const wc = useMemo(() => wordCount(form.content), [form.content]);
  const checks = [
    [titleLen >= 25 && titleLen <= 60, `Title length ${titleLen} (aim for 25–60 characters)`],
    [descLen >= 110 && descLen <= 160, `Description length ${descLen} (aim for 110–160 characters)`],
    [!!form.excerpt || !!form.seoDescription, "Has a hand-written excerpt or meta description"],
    [!!form.coverImage, "Has a cover image (used for cards and the share preview)"],
    [form.tags.length >= 2, `Has 2+ tags (${form.tags.length})`],
    [wc >= 300, `Word count ${wc} (300+ reads as substantial)`],
    [/^#{2}\s/m.test(form.content), "Uses H2 headings (powers the table of contents)"],
    [imgs.length === 0 || imgs.every((i) => i.alt.trim()), imgs.length ? "All images have alt text" : "No images to check"],
    [form.slug.length > 0 && form.slug.length <= 60, `Short slug (${form.slug.length} chars)`],
    [form.tags.some((t) => `${form.title} ${autoDesc}`.toLowerCase().includes(t.toLowerCase())), "A tag appears in the title or opening text"],
  ];
  const ogPreview = ogImageUrl({ title: seoTitle, tags: form.tags, cover: form.coverImage.startsWith("/media/") ? form.coverImage : "" }).replace(SITE.url, "");

  const status = !form.published ? "Draft" : form.publishedAt && new Date(form.publishedAt) > new Date() ? "Scheduled" : "Live";

  return (
    <AdminShell
      title={isNew && !id ? "New post" : "Edit post"}
      actions={
        <div className={styles.editorActions}>
          <span className={`${styles.badge} ${styles[`badge_${status === "Live" ? "published" : status.toLowerCase()}`]}`}>{status}</span>
          <span className={styles.saveState}>{saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</span>
          {id && form.published && (
            <a className={styles.btn} href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer">
              View ↗
            </a>
          )}
          <button className={styles.btn} onClick={() => save()} disabled={saving || !dirty}>
            Save
          </button>
          <button className={styles.btnPrimary} onClick={() => save(!form.published)} disabled={saving}>
            {form.published ? "Unpublish" : "Publish"}
          </button>
          <button className={`${styles.btn} ${styles.settingsBtn}`} onClick={() => setPanel(true)}>
            Settings
          </button>
        </div>
      }
    >
      {restorable && (
        <div className={styles.banner}>
          <span>
            Found an unsaved local draft from {new Date(restorable.at).toLocaleString()}.
          </span>
          <button
            className={styles.btn}
            onClick={() => {
              setForm(restorable.form);
              setSlugTouched(true);
              setRestorable(null);
            }}
          >
            Restore
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              try {
                localStorage.removeItem(draftKey);
              } catch {}
              setRestorable(null);
            }}
          >
            Discard
          </button>
        </div>
      )}

      <div className={styles.editorGrid}>
        <section className={styles.writer}>
          <input
            className={styles.titleInput}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Post title"
            aria-label="Post title"
            maxLength={200}
          />

          <div className={styles.toolbar2} role="toolbar" aria-label="Formatting">
            <button type="button" onClick={wrap("**")} title="Bold (Ctrl+B)"><b>B</b></button>
            <button type="button" onClick={wrap("*")} title="Italic (Ctrl+I)"><i>I</i></button>
            <button type="button" onClick={linePrefix("## ")} title="Heading 2">H2</button>
            <button type="button" onClick={linePrefix("### ")} title="Heading 3">H3</button>
            <span className={styles.sep} />
            <button type="button" onClick={linePrefix("- ")} title="Bulleted list">• List</button>
            <button type="button" onClick={linePrefix("1. ")} title="Numbered list">1. List</button>
            <button type="button" onClick={linePrefix("> ")} title="Quote">Quote</button>
            <span className={styles.sep} />
            <button type="button" onClick={wrap("`")} title="Inline code">{"<>"}</button>
            <button type="button" onClick={codeBlock} title="Code block">{"{ }"}</button>
            <button type="button" onClick={link} title="Link">Link</button>
            <button type="button" onClick={() => setPicker("inline")} title="Insert image">Image</button>
            <span className={styles.spacer} />
            <div className={styles.viewSwitch} role="group" aria-label="View">
              {["write", "split", "preview"].map((v) => (
                <button key={v} type="button" className={`${view === v ? styles.viewOn : ""} ${v === "split" ? styles.splitOnly : ""}`} onClick={() => setView(v)}>
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.panes} ${styles[`view_${view}`]}`}>
            {view !== "preview" && (
              <textarea
                ref={area}
                className={styles.markdown}
                value={form.content}
                onChange={(e) => set({ content: e.target.value })}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onDrop={onDrop}
                onDragOver={(e) => e.dataTransfer?.types?.includes("Files") && e.preventDefault()}
                placeholder={"Start writing in Markdown…\n\nTip: paste or drag an image straight in."}
                spellCheck
                aria-label="Post content"
              />
            )}
            {view !== "write" && (
              <div className={styles.previewPane}>
                {form.content.trim() ? (
                  <div className="prose" dangerouslySetInnerHTML={{ __html: preview.html }} />
                ) : (
                  <p className={styles.muted}>Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
          <p className={styles.counter}>
            {words} words · {Math.max(1, Math.ceil(words / 200))} min read
          </p>
        </section>

        {panel && <div className={styles.scrim} onClick={() => setPanel(false)} />}
        <aside className={`${styles.settings} ${panel ? styles.settingsOpen : ""}`}>
          <div className={styles.settingsHead}>
            <h2>Post settings</h2>
            <button className={styles.btn} onClick={() => setPanel(false)}>
              Done
            </button>
          </div>

          <label className={styles.field}>
            <span>Slug</span>
            <input
              className={`${styles.input} ${styles.mono}`}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: slugify(e.target.value) });
              }}
              placeholder="post-url-slug"
            />
            <small>{SITE.url.replace("https://", "")}/blog/{form.slug || "slug"}</small>
          </label>

          <label className={styles.field}>
            <span>Excerpt</span>
            <textarea className={styles.input} rows={3} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} maxLength={400} placeholder="One or two sentences for cards, search results & social shares" />
            <small>{form.excerpt.length}/400</small>
          </label>

          <div className={styles.field}>
            <span>Tags</span>
            <div className={styles.tagBox}>
              {form.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}>
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                list="known-tags"
                onChange={(e) => {
                  if (e.target.value.endsWith(",")) addTag(e.target.value);
                  else setTagInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  } else if (e.key === "Backspace" && !tagInput && form.tags.length) {
                    set({ tags: form.tags.slice(0, -1) });
                  }
                }}
                onBlur={() => addTag(tagInput)}
                placeholder={form.tags.length ? "" : "react, nextjs, ai"}
              />
              <datalist id="known-tags">
                {knownTags.filter((t) => !form.tags.includes(t)).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <small>Press Enter or comma to add.</small>
          </div>

          <div className={styles.field}>
            <span>Cover image</span>
            {form.coverImage ? (
              <div className={styles.coverBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt="" />
                <div>
                  <button type="button" className={styles.btn} onClick={() => setPicker("cover")}>
                    Change
                  </button>
                  <button type="button" className={styles.btnGhostDanger} onClick={() => set({ coverImage: "" })}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={styles.btn} onClick={() => setPicker("cover")}>
                Choose or upload…
              </button>
            )}
            <small>Used on cards and as the social share background.</small>
          </div>

          <div className={styles.row2}>
            <label className={styles.check}>
              <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} />
              <span>Featured on home</span>
            </label>
          </div>

          <label className={styles.field}>
            <span>Publish date</span>
            <input type="datetime-local" className={styles.input} value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} />
            <small>Leave empty to use the creation date. Pick a future time to schedule (then press Publish).</small>
          </label>

          <details className={styles.seo} open>
            <summary>SEO &amp; sharing</summary>
            <label className={styles.field}>
              <span>SEO title</span>
              <input className={styles.input} value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} placeholder={form.title} maxLength={120} />
              <small className={form.seoTitle.length > 60 ? styles.warn : ""}>{(form.seoTitle || form.title).length}/60 recommended</small>
            </label>
            <label className={styles.field}>
              <span>Meta description</span>
              <textarea className={styles.input} rows={3} value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} placeholder={form.excerpt || autoDesc} maxLength={300} />
              <small className={descLen > 160 ? styles.warn : ""}>
                {descLen}/160 recommended
                {!form.seoDescription && !form.excerpt && autoDesc ? " · auto-generated from your first paragraph" : ""}
              </small>
            </label>

            <div className={styles.serp}>
              <span className={styles.serpUrl}>{SITE.url.replace("https://", "")} › blog › {form.slug || "slug"}</span>
              <span className={styles.serpTitle}>{seoTitle.slice(0, 70)} | {SITE.name}</span>
              <span className={styles.serpDesc}>{seoDesc.slice(0, 160)}</span>
            </div>

            <div className={styles.field}>
              <span>Keyword ideas from your text</span>
              {suggested.length ? (
                <div className={styles.kwRow}>
                  {suggested.map((k) => (
                    <button key={k} type="button" className="chip" title="Add as tag" onClick={() => form.tags.length < 10 && set({ tags: [...form.tags, k] })}>
                      + {k}
                    </button>
                  ))}
                </div>
              ) : (
                <small>Write a little more and suggestions will appear.</small>
              )}
              <small>Click to add as a tag. Tags become the page&apos;s meta keywords and structured-data topics.</small>
            </div>

            <ul className={styles.audit} aria-label="SEO checklist">
              {checks.map(([ok, label]) => (
                <li key={label} className={ok ? styles.auditOk : styles.auditWarn}>
                  {label}
                </li>
              ))}
            </ul>

            <div className={styles.field}>
              <span>Social share card</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.ogPreview} src={ogPreview} alt="Social card preview" loading="lazy" />
              <small>Generated automatically from the title, tags and cover.</small>
            </div>
          </details>

          {id && (
            <div className={styles.danger}>
              <button type="button" className={styles.btnDanger} onClick={() => setConfirmDelete(true)}>
                Delete post
              </button>
            </div>
          )}
        </aside>
      </div>

      {picker && (
        <div className={styles.modalScrim} onClick={() => setPicker(null)}>
          <div className={styles.pickerModal} role="dialog" aria-modal="true" aria-label="Media" onClick={(e) => e.stopPropagation()}>
            <div className={styles.settingsHead}>
              <h2>{picker === "cover" ? "Choose a cover image" : "Insert an image"}</h2>
              <button className={styles.btn} onClick={() => setPicker(null)}>
                Close
              </button>
            </div>
            <MediaLibrary
              selectLabel={picker === "cover" ? "Use as cover" : "Insert"}
              onSelect={(m, alt) => {
                if (picker === "cover") set({ coverImage: m.url });
                else insert(`\n![${alt}](${m.url})\n`);
                setPicker(null);
              }}
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this post?"
          body={`"${form.title || "Untitled"}" will be permanently removed.`}
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </AdminShell>
  );
}
