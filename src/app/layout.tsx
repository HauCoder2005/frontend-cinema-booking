import React from "react";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import { Toaster as SonnerToaster } from "sonner";
import ClientLayoutWrapper from "./component/layout/ClientLayoutWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import StoreProvider from "@/providers/StoreProvider";
import AppThemeProvider from "@/providers/AppThemeProvider";
import { GlobalRouteGuard } from "@/guards";
import { Metadata } from "next";

const inter = Inter({
  variable: "--font-heading",
  display: "swap",
  subsets: ["latin", "vietnamese"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  display: "swap",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cinema Booking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${beVietnamPro.variable}`}>
        <QueryProvider>
          <StoreProvider>
            <AppThemeProvider>
              <AuthProvider>
                <GlobalRouteGuard>
                  <ClientLayoutWrapper>
                    {children}
                  </ClientLayoutWrapper>
                  <SonnerToaster richColors closeButton position="top-right" />
                </GlobalRouteGuard>
              </AuthProvider>
            </AppThemeProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
