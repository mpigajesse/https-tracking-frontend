import type { Metadata, Viewport } from "next";
import "./mobile.css";
import { MobileStoreProvider } from "@/lib/mobile/store";
import { MobileThemeProvider } from "@/lib/mobile/theme";
import { MobileShell } from "@/components/mobile/MobileShell";

export const metadata: Metadata = {
  title: "Lear Track — Poste de pointage",
  description:
    "Application mobile de pointage des intérimaires Lear : scan QR au poste, validation d'identité, arbitrage des pauses et clôture des sessions.",
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-app">
      <MobileThemeProvider>
        <MobileStoreProvider>
          <MobileShell>{children}</MobileShell>
        </MobileStoreProvider>
      </MobileThemeProvider>
    </div>
  );
}
