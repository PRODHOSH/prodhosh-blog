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

  // Lazy images, safe external links, and a language label for code blocks.
  const rehypeDecorate = () => (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
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

export async function renderMarkdown(source = "") {
  processorPromise ||= buildProcessor();
  const processor = await processorPromise;
  const file = await processor.process(source);
  return { html: String(file), toc: file.data.toc || [] };
}

export function readingStats(content = "") {
  const rt = readingTime(content);
  const mins = Math.max(1, Math.ceil(rt.minutes));
  return { readingTime: `${mins} min read`, wordCount: rt.words };
}
