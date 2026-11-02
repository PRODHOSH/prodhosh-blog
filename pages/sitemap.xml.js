import { getSortedPostsData } from "../lib/posts";
import { sitemapIndex } from "../lib/sitemap";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  return sendText(res, sitemapIndex(await getSortedPostsData()), "application/xml; charset=utf-8");
}

export default function Sitemap() {
  return null;
}
