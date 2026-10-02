import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Ente Vaahanam",
  description: "Track vehicle maintenance and get reminded before things are due.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Ente Vaahanam", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#0f766e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
