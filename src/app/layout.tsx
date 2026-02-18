import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  Syne,
  Space_Grotesk,
  DM_Sans,
  DM_Serif_Display,
} from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import ServiceWorkerRegistrar from "@/components/ui/ServiceWorkerRegistrar";

/* ── Premium Google Fonts ─────────────────────────────────────── */
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lear Corporation – Pointage Intérimaires",
  description:
    "Plateforme de gestion et pointage des travailleurs intérimaires – Lear Corporation",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lear Track",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = [
    GeistSans.variable,
    GeistMono.variable,
    syne.variable,
    spaceGrotesk.variable,
    dmSans.variable,
    dmSerifDisplay.variable,
  ].join(" ");

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
          <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${fontClasses} antialiased`}>
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1C1C1C",
                    color: "#F5F5F5",
                    border: "1px solid #2A2A2A",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "var(--font-geist-sans), var(--font-dm-sans), sans-serif",
                  },
                  success: {
                    iconTheme: { primary: "#16A34A", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "#CC0000", secondary: "#fff" },
                  },
              }}
            />
              <PWAInstallBanner />
              <ServiceWorkerRegistrar />
              <VisualEditsMessenger />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
