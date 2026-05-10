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
  alternates: {
    canonical: "https://referbenefits.co.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
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
              strategy="afterInteractive" 
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
