"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Header from "./client/Header";
import Footer from "./client/Footer";
import { getRouteConfig } from "@/config/routes.config";

import NavigationProgressBar from "@/components/common/NavigationProgressBar";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const routeConfig = pathname ? getRouteConfig(pathname) : null;
  const isAdminRoute =
    routeConfig?.guard === "admin" ||
    routeConfig?.guard === "admin-only" ||
    pathname?.startsWith("/admin");

  // Nếu là admin route, render children trong container theme
  if (isAdminRoute) {
    return (
      <NavigationProgressBar>
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }}>
          {children}
        </Box>
      </NavigationProgressBar>
    );
  }

  // Nếu là client route, render với Header và Footer
  return (
    <NavigationProgressBar>
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }}>
        <Header />
        <div className="min-h-[calc(100vh-64px)]">{children}</div>
        <Footer />
      </Box>
    </NavigationProgressBar>
  );
}

