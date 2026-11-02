import { getPostsWithContent } from "../lib/posts";
import { postsSitemap } from "../lib/sitemap";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  return sendText(res, postsSitemap(await getPostsWithContent()), "application/xml; charset=utf-8");
}

export default function SitemapPosts() {
  return null;
}
