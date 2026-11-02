import { SITE } from "../lib/site";
import { sendText } from "../lib/respond";

// Crawlers that fetch pages to answer questions or index the web. All are welcome;
// they are listed explicitly so the policy is unambiguous.
const SEARCH = ["Googlebot", "Googlebot-Image", "Googlebot-News", "Bingbot", "DuckDuckBot", "Slurp", "Applebot", "YandexBot", "Baiduspider"];
const AI = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", // OpenAI
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", // Anthropic
  "PerplexityBot", "Perplexity-User", // Perplexity
  "Google-Extended", "Applebot-Extended", // Gemini / Apple Intelligence training controls
  "Meta-ExternalAgent", "Amazonbot", "CCBot", "cohere-ai", "YouBot", "DuckAssistBot", "MistralAI-User",
];
const SOCIAL = ["facebookexternalhit", "Twitterbot", "LinkedInBot", "WhatsApp", "Slackbot", "Discordbot", "TelegramBot"];

const RULES = ["Allow: /", "Allow: /media/", "Allow: /og", "Disallow: /admin/", "Disallow: /api/", "Disallow: /md/"];

const group = (label, agents) => `# ${label}\n${agents.map((a) => `User-agent: ${a}`).join("\n")}\n${RULES.join("\n")}\n`;

export async function getServerSideProps({ res }) {
  const body = `# ${SITE.name} — ${SITE.url}
# Crawling is welcome. Admin screens and raw API routes are off limits.
# Machine-readable guides for LLMs: ${SITE.url}/llms.txt and ${SITE.url}/llms-full.txt

${group("Everyone else", ["*"])}
${group("Search engines", SEARCH)}
${group("AI assistants & answer engines", AI)}
${group("Link-preview bots (needed for social share cards)", SOCIAL)}
Sitemap: ${SITE.url}/sitemap.xml
`;
  return sendText(res, body, "text/plain; charset=utf-8", { maxAge: 3600, swr: 86400 });
}

export default function Robots() {
  return null;
}
