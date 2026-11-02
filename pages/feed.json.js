import { getPostsWithContent } from "../lib/posts";
import { buildJsonFeed } from "../lib/feeds";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  return sendText(res, await buildJsonFeed(await getPostsWithContent()), "application/feed+json; charset=utf-8");
}

export default function JsonFeed() {
  return null;
}
