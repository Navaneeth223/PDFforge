import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import "@/styles/globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "PDFForge — Every PDF Tool. Free Forever. Open Source.",
    template: "%s | PDFForge",
  },
  description:
    "PDFForge is a free, self-hostable, open-source PDF toolkit. Merge, split, compress, convert, edit, sign, and protect PDFs — no registration, no watermarks, no limits.",
  keywords: [
    "PDF editor", "merge PDF", "split PDF", "compress PDF",
    "PDF to Word", "PDF tools", "free PDF", "open source PDF",
  ],
  authors: [{ name: "PDFForge" }],
  creator: "PDFForge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfforge.app",
    title: "PDFForge — Every PDF Tool. Free Forever.",
    description: "25+ free PDF tools. No registration. No watermarks. Open source.",
    siteName: "PDFForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFForge — Every PDF Tool. Free Forever.",
    description: "25+ free PDF tools. No registration. No watermarks. Open source.",
  },
  robots: { index: true, follow: true },
  themeColor: "#09090f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(240 8% 9%)",
              border: "1px solid hsl(240 6% 14%)",
              color: "hsl(0 0% 95%)",
            },
          }}
        />
      </body>
    </html>
  );
}
