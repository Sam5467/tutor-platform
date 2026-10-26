import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { NoticeBanner } from "@/components/notice-banner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = "https://www.passalonglb.com";
const DESCRIPTION =
  "Find a senior student who already passed your course. Peer tutoring for university students in Lebanon: AUB, LAU, USJ, USEK, NDU, LU, BAU and UOB. Free for students.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Passalong | University Tutoring in Lebanon, Student to Student",
    template: "%s | Passalong",
  },
  description: DESCRIPTION,
  applicationName: "Passalong",
  openGraph: {
    type: "website",
    siteName: "Passalong",
    locale: "en_US",
    url: SITE_URL,
    title: "Passalong | University Tutoring in Lebanon, Student to Student",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Passalong | University Tutoring in Lebanon",
    description: DESCRIPTION,
  },
};

// Tells Google the site's name and what it is, for nicer search results.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Passalong",
      alternateName: "Passalong Lebanon",
      url: SITE_URL,
    },
    {
      "@type": "Organization",
      name: "Passalong",
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon.png`,
      email: "passalonglb@gmail.com",
      areaServed: "Lebanon",
      description: DESCRIPTION,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Header />
        <Suspense>
          <NoticeBanner />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
