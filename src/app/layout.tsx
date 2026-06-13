import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "./providers";
import Script from "next/script";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://referbenefits.co.in"),
  title: {
    default: "ReferBenefits | India's Best Sign Up Bonuses & Referral Codes",
    template: "%s | ReferBenefits",
  },
  description: "Find the latest and verified referral codes, sign-up bonuses, and invite links for top Indian apps (CRED, Swiggy, Groww, and more). Updated daily.",
  openGraph: {
    title: "ReferBenefits | India's Best Sign Up Bonuses",
    description: "Discover verified referral codes and sign-up bonuses to earn extra cash on top apps.",
    url: "https://referbenefits.co.in",
    siteName: "ReferBenefits",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferBenefits | India's Best Sign Up Bonuses",
    description: "Discover verified referral codes and sign-up bonuses to earn extra cash on top apps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://referbenefits.co.in/#organization",
        "name": "ReferBenefits",
        "url": "https://referbenefits.co.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://referbenefits.co.in/logo.png"
        },
        "sameAs": [
          "https://twitter.com/referbenefits",
          "https://t.me/referbenefits",
          "https://linkedin.com/company/referbenefits"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://referbenefits.co.in/#website",
        "url": "https://referbenefits.co.in",
        "name": "ReferBenefits",
        "publisher": {
          "@id": "https://referbenefits.co.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://referbenefits.co.in/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
        />
      </head>
      <body>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-5EV07XX9Y4" strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                if (window.localStorage && window.localStorage.getItem('disable_ga') === 'true') {
                  window['ga-disable-G-5EV07XX9Y4'] = true;
                } else {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-5EV07XX9Y4');
                }
              `}
            </Script>
            
            {/* Google AdSense */}
            <Script 
              async 
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8766645415313410" 
              crossOrigin="anonymous" 
              strategy="lazyOnload" 
            />
          </>
        )}
        <ThemeProvider>
          <InteractiveBackground />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
