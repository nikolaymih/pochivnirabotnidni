import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import NetworkStatus from "@/components/NetworkStatus";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Почивни Работни Дни - Календар с Български Празници 2026",
  description: "Преглед на българските официални празници и планиране на вашите дни за отпуск с интерактивен календар за 2026",
  manifest: "/manifest.json",
  themeColor: "#C68E17",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Почивни Дни",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body
        className={`${nunito.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { marginBottom: '80px' }
          }}
        />
        <NetworkStatus />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
