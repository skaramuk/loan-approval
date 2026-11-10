import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";

import { Providers } from "@/components/providers";
import { UYGULAMA } from "@/lib/metinler";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

// latin-ext carries the Turkish letters (ğ, ş, ı, İ).
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: `${UYGULAMA.ad} — ${UYGULAMA.slogan}`, template: `%s · ${UYGULAMA.ad}` },
  description: UYGULAMA.aciklama,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#12141d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
