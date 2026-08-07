"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function NavigationProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      if (!target) return;

      const targetUrl = target.getAttribute("href");
      if (!targetUrl || targetUrl.startsWith("#") || targetUrl.startsWith("javascript:")) return;

      if (target.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;

      try {
        const currentUrlObj = new URL(window.location.href);
        const targetUrlObj = new URL(targetUrl, window.location.href);

        if (
          targetUrlObj.origin === currentUrlObj.origin &&
          targetUrlObj.pathname !== currentUrlObj.pathname
        ) {
          setLoading(true);
        }
      } catch (err) {
        // Ignored
      }
    };

    const attachListeners = () => {
      const anchors = document.querySelectorAll<HTMLAnchorElement>("a[href]");
      anchors.forEach((a) => {
        a.removeEventListener("click", handleAnchorClick);
        a.addEventListener("click", handleAnchorClick);
      });
    };

    attachListeners();

    const observer = new MutationObserver(() => {
      attachListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const anchors = document.querySelectorAll<HTMLAnchorElement>("a[href]");
      anchors.forEach((a) => {
        a.removeEventListener("click", handleAnchorClick);
      });
    };
  }, []);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backgroundColor: "rgba(8, 9, 11, 0.75)",
        backdropFilter: "blur(6px)",
        transition: "all 200ms ease",
      }}
    >
      <CircularProgress
        size={48}
        thickness={4}
        sx={{
          color: "#FF1F2D",
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: "#F5F7FA",
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontSize: "0.875rem",
        }}
      >
        Đang tải...
      </Typography>
    </Box>
  );
}

export default function NavigationProgressBar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgressIndicator />
      </Suspense>
      {children}
    </>
  );
}
