import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "./providers";
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
    default: "ReferralBuddy | India's Best Sign Up Bonuses & Referral Codes",
    template: "%s | ReferralBuddy",
  },
  description: "Find the latest and verified referral codes, sign-up bonuses, and invite links for top Indian apps (CRED, Swiggy, Groww, and more). Updated daily.",
  openGraph: {
    title: "ReferralBuddy | India's Best Sign Up Bonuses",
    description: "Discover verified referral codes and sign-up bonuses to earn extra cash on top apps.",
    url: "https://referbenefits.co.in",
    siteName: "ReferralBuddy",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferralBuddy | India's Best Sign Up Bonuses",
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
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
