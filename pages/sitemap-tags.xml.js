import { getAllTags, getSortedPostsData } from "../lib/posts";
import { tagsSitemap } from "../lib/sitemap";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  const posts = await getSortedPostsData();
  return sendText(res, tagsSitemap(await getAllTags(posts), posts), "application/xml; charset=utf-8");
}

export default function SitemapTags() {
  return null;
}
