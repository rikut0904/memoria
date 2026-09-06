import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import TokenBridge from "./token-bridge";

const siteTitle = "Memoria - ヘルプ";
const siteDescription = "Memoriaのヘルプページです。";
const siteImages = ["/img/app.png"];

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: "/img/favicon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: siteImages,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: siteImages,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <TokenBridge />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
