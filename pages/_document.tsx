import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
        
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DM3FMXYMGN"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
            {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-DM3FMXYMGN');
            `}
        </Script>
      </body>
    </Html>
  );
}
