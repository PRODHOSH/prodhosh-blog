import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="author" content="Prodhosh VS" />
        <meta name="theme-color" content="#5E548E" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />

        {/* Default OG */}
        <meta property="og:site_name" content="ProdhoshBlogs" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://blog.prodhosh.me/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_IN" />

        {/* Default Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@prodhosh3" />
        <meta name="twitter:creator" content="@prodhosh3" />
        <meta name="twitter:image" content="https://blog.prodhosh.me/og-image.png" />

        {/* Fonts & Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
