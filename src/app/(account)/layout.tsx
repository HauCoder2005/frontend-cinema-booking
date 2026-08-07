"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import AccountSidebar from "@/app/component/account-sidebar/AccountSidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        pt: { xs: 3, md: 5 },
        pb: { xs: 4, md: 8 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* Account Sidebar Paper */}
        <Paper
          elevation={0}
          component="aside"
          sx={{
            width: { xs: "100%", md: "260px" },
            flexShrink: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          <AccountSidebar />
        </Paper>

        {/* Right Side Content Paper */}
        <Paper
          elevation={0}
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
