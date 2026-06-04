import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="author" content="Prodhosh VS" />
        <meta name="theme-color" content="#5E548E" />

        {/* Preconnect for performance (Core Web Vitals) */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Default OG — overridden per page */}
        <meta property="og:site_name" content="ProdhoshBlogs" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://blog.prodhosh.me/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ProdhoshBlogs — Thoughts on Tech, AI & Building Things" />
        <meta property="og:locale" content="en_IN" />

        {/* Default Twitter Card — overridden per page */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@prodhosh3" />
        <meta name="twitter:creator" content="@prodhosh3" />
        <meta name="twitter:image" content="https://blog.prodhosh.me/og-image.png" />
        <meta name="twitter:image:alt" content="ProdhoshBlogs — Thoughts on Tech, AI & Building Things" />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-32JNX7ZWHL" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-32JNX7ZWHL');
            `,
          }}
        />
      </body>
    </Html>
  );
}
