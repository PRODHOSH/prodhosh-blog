import { getSortedPostsData } from "../lib/posts";
import { pagesSitemap } from "../lib/sitemap";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  return sendText(res, pagesSitemap(await getSortedPostsData()), "application/xml; charset=utf-8");
}

export default function SitemapPages() {
  return null;
}
