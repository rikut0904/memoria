import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import TokenBridge from "./token-bridge";
import LogoutSync from "./logout-sync";

const siteTitle = "Memoria - 管理";
const siteDescription =
  "大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。";
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
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a9e84c25-b00e-4991-a1d8-38d5b314563b"
        ></script>
        <GoogleAnalytics gaId="G-WLKP58YCP3" />
      </head>
      <body>
        <Suspense fallback={null}>
          <TokenBridge />
        </Suspense>
        <Suspense fallback={null}>
          <LogoutSync />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
