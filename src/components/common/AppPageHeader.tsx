"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export default function AppPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: AppPageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 1, "& .MuiBreadcrumbs-li": { fontSize: "0.875rem" } }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !item.href) {
              return (
                <Typography key={index} color="text.primary" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  {item.label}
                </Typography>
              );
            }
            return (
              <Link key={index} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.875rem",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, tracking: "-0.02em" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
