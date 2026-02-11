import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { getYear } from "date-fns";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import NetworkStatus from "@/components/NetworkStatus";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { PAGE_TITLE, META_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "@/lib/constants";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const year = getYear(new Date());
  return {
    title: `${APP_NAME} - ${PAGE_TITLE(year)}`,
    description: META_DESCRIPTION(year),
    manifest: "/manifest.json",
    icons: {
      icon: '/klogo.png',
      apple: '/klogo.png',
    },
    themeColor: "#C68E17",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_SHORT_NAME,
    },
  };
}

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
