import { getPostsWithContent } from "../lib/posts";
import { buildRss } from "../lib/feeds";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  return sendText(res, await buildRss(await getPostsWithContent()), "application/rss+xml; charset=utf-8");
}

export default function Feed() {
  return null;
}
