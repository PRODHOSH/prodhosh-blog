import { getAllTags, getPostsWithContent } from "../lib/posts";
import { buildLlmsTxt } from "../lib/llms";
import { sendText } from "../lib/respond";

export async function getServerSideProps({ res }) {
  const posts = await getPostsWithContent();
  return sendText(res, buildLlmsTxt(posts, await getAllTags(posts)), "text/plain; charset=utf-8");
}

export default function LlmsTxt() {
  return null;
}
