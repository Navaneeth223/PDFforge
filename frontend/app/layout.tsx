import type { Metadata } from "next";
import { Inter, Roboto_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
});

export const viewport = {
  themeColor: "#09090f",
};

export const metadata: Metadata = {
  title: {
    default: "Docxio — Every Document & PDF Tool. Free Forever. Open Source.",
    template: "%s | Docxio",
  },
  description:
    "Docxio is a free, self-hostable, open-source document toolkit. Edit PDFs, convert Word/Excel/PPT, AI background removal, and a visual Canvas editor — no registration, no limits.",
  keywords: [
    "PDF editor", "Word to PDF", "Excel to PDF", "Canvas editor",
    "document tools", "free PDF", "open source PDF", "background removal",
  ],
  authors: [{ name: "Docxio" }],
  creator: "Docxio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docxio.app",
    title: "Docxio — Every Document & PDF Tool. Free Forever.",
    description: "45+ free document tools. No registration. No watermarks. Open source.",
    siteName: "Docxio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docxio — Every Document & PDF Tool. Free Forever.",
    description: "45+ free document tools. No registration. No watermarks. Open source.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}
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
