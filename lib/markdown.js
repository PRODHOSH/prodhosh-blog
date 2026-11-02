// One markdown pipeline used by the public site AND the admin live preview,
// so what you preview is exactly what gets published.
import readingTime from "reading-time";

let processorPromise;

async function buildProcessor() {
  const [
    { unified },
    { default: remarkParse },
    { default: remarkGfm },
    { default: remarkRehype },
    { default: rehypeRaw },
    { default: rehypeSanitize, defaultSchema },
    { default: rehypeSlug },
    { default: rehypeAutolinkHeadings },
    { default: rehypeHighlight },
    { default: rehypeStringify },
    { toString },
    { visit },
  ] = await Promise.all([
    import("unified"),
    import("remark-parse"),
    import("remark-gfm"),
    import("remark-rehype"),
    import("rehype-raw"),
    import("rehype-sanitize"),
    import("rehype-slug"),
    import("rehype-autolink-headings"),
    import("rehype-highlight"),
    import("rehype-stringify"),
    import("hast-util-to-string"),
    import("unist-util-visit"),
  ]);

  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      img: [...(defaultSchema.attributes?.img || []), "loading", "decoding", "width", "height"],
    },
  };

  // Collect h2/h3 for the table of contents.
  const rehypeToc = () => (tree, file) => {
    const toc = [];
    visit(tree, "element", (node) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        toc.push({ id: node.properties.id, text: toString(node), level: Number(node.tagName[1]) });
      }
    });
    file.data.toc = toc;
  };

  // Lazy images (with auto alt text), safe external links, and a language label for code blocks.
  const rehypeDecorate = () => (tree, file) => {
    const title = file.data?.title || "";
    let heading = "";
    const used = new Map();
    const weakAlt = (a) => !a || /\.(png|jpe?g|gif|webp|svg)$/i.test(a) || /^(image|img|screenshot|untitled|photo|picture|chatgpt image)\b/i.test(a);

    visit(tree, "element", (node) => {
      if (/^h[1-4]$/.test(node.tagName)) heading = toString(node).replace(/#$/, "").trim();
      if (node.tagName === "img") {
        const alt = String(node.properties?.alt || "").trim();
        let nextAlt = alt;
        if (weakAlt(alt)) {
          // Accessibility + image SEO: describe the image by the section it sits in.
          const base = heading || title || "Illustration";
          const n = (used.get(base) || 0) + 1;
          used.set(base, n);
          nextAlt = n > 1 ? `${base} (${n})` : base;
        }
        node.properties = { ...node.properties, alt: nextAlt, loading: "lazy", decoding: "async" };
      } else if (node.tagName === "a") {
        const href = String(node.properties?.href || "");
        if (/^https?:\/\//i.test(href) && !href.startsWith("https://blog.prodhosh.me")) {
          node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" };
        }
      } else if (node.tagName === "pre") {
        const code = node.children?.find((c) => c.type === "element" && c.tagName === "code");
        const cls = code?.properties?.className || [];
        const lang = cls.find((c) => String(c).startsWith("language-"));
        node.properties = { ...node.properties, dataLanguage: lang ? String(lang).slice(9) : "text" };
      }
    });
  };

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeSlug)
    .use(rehypeToc)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["anchor"], ariaLabel: "Link to this section", tabIndex: -1 },
      content: { type: "text", value: "#" },
    })
    .use(rehypeHighlight, { ignoreMissing: true })
    .use(rehypeDecorate)
    .use(rehypeStringify);
}

export async function renderMarkdown(source = "", { title = "" } = {}) {
  processorPromise ||= buildProcessor();
  const processor = await processorPromise;
  const file = await processor.process({ value: source, data: { title } });
  return { html: String(file), toc: file.data.toc || [] };
}

export function readingStats(content = "") {
  const rt = readingTime(content);
  const mins = Math.max(1, Math.ceil(rt.minutes));
  return { readingTime: `${mins} min read`, wordCount: rt.words };
}
