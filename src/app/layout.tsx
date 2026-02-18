import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PointagePro – Application de Pointage Intérimaires",
  description: "Plateforme de gestion et pointage des travailleurs intérimaires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#16A34A", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#DC2626", secondary: "#fff" },
              },
            }}
          />
          <VisualEditsMessenger />
        </AuthProvider>
      </body>
    </html>
  );
}
