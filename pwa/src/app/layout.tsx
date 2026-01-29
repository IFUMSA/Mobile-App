import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { InstallPrompt } from "@/components/ui/install-prompt";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IFUMSA",
  description: "IFUMSA - Learn, Grow and Succeed Together",
  icons: {
    icon: "/images/ifumsa-logo.png",
    apple: "/images/ifumsa-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IFUMSA",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1F382E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <InstallPrompt />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
