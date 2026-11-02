import { Html, Head, Main, NextScript } from "next/document";
import { SITE } from "../lib/site";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="author" content={SITE.author.name} />
        <meta name="theme-color" content={SITE.themeColor} />
        <meta name="application-name" content={SITE.name} />
        <meta name="apple-mobile-web-app-title" content={SITE.name} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="generator" content="Next.js" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="me" href={SITE.author.url} />
        <link rel="author" href={SITE.author.url} />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="alternate" type="application/rss+xml" title={`${SITE.name} RSS`} href={`${SITE.url}/feed.xml`} />
        <link rel="alternate" type="application/feed+json" title={`${SITE.name} JSON feed`} href={`${SITE.url}/feed.json`} />
        <link rel="alternate" type="text/plain" title="llms.txt" href={`${SITE.url}/llms.txt`} />
        <link rel="sitemap" type="application/xml" href={`${SITE.url}/sitemap.xml`} />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.gaId}');`,
          }}
        />
      </body>
    </Html>
  );
}
