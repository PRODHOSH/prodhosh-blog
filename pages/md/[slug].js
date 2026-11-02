import { getPostMarkdown } from "../../lib/posts";
import { buildPostMarkdown } from "../../lib/llms";
import { absUrl } from "../../lib/site";
import { sendText } from "../../lib/respond";

// Clean Markdown of a single article, served at /blog/<slug>.md (see rewrites in next.config.mjs).
// It points search engines back to the HTML page so the two are never seen as duplicates.
export async function getServerSideProps({ params, res }) {
  const post = await getPostMarkdown(params.slug);
  if (!post) return { notFound: true };
  return sendText(res, buildPostMarkdown(post), "text/markdown; charset=utf-8", {
    headers: {
      Link: `<${absUrl(`/blog/${post.slug}`)}>; rel="canonical"`,
      "X-Robots-Tag": "noindex",
      "Content-Disposition": "inline",
    },
  });
}

export default function PostMarkdown() {
  return null;
}
