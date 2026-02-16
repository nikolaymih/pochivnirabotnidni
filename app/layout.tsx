import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { getYear } from "date-fns";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import NetworkStatus from "@/components/NetworkStatus";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { PAGE_TITLE, META_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const BASE_URL = 'https://kolkoshtepochivam.com';

export const viewport: Viewport = {
  themeColor: '#C68E17',
};

export function generateMetadata(): Metadata {
  const year = getYear(new Date());
  const title = `${APP_NAME} - ${PAGE_TITLE(year)}`;
  const description = META_DESCRIPTION(year);
  return {
    title,
    description,
    manifest: "/manifest.json",
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: '/klogo.png',
      apple: '/klogo.png',
    },
    openGraph: {
      title,
      description,
      url: BASE_URL,
      siteName: APP_NAME,
      locale: 'bg_BG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_SHORT_NAME
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
          <Analytics />
          <SpeedInsights />
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
