"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LogoutIcon from "@mui/icons-material/Logout";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import AdminNotificationBell from "@/app/component/layout/admin/AdminNotificationBell";
import { getMenuForRole, DashboardMenuItem } from "@/config/dashboard-menu";
import QrScannerModal from "@/components/common/QrScannerModal";

import { notify } from "@/lib/notifications";

const SIDEBAR_WIDTH = 256;
const HEADER_HEIGHT = 68;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "staff-schedules": true,
  });

  React.useEffect(() => {
    if (pathname.startsWith("/admin/staff-schedules")) {
      setOpenSubMenus((prev) => ({ ...prev, "staff-schedules": true }));
    }
  }, [pathname]);

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const roleMenu = getMenuForRole(user?.role, user?.position);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    notify.success("Đăng xuất thành công!");
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  const renderSidebarContent = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        borderRadius: "0px",
      }}
    >
      {/* Brand Logo */}
      <Box
        sx={{
          height: HEADER_HEIGHT,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          borderRadius: "0px",
        }}
      >
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo/logo_cinema.png" alt="Cinema Admin" style={{ height: "36px", width: "auto" }} />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "text.primary", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}
            >
              CINEMA
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.6875rem", letterSpacing: 1 }}>
              DASHBOARD
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, py: 2, px: 1, overflowY: "auto" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: "uppercase", px: 2, mb: 1, display: "block", fontSize: "0.6875rem", letterSpacing: 1 }}
        >
          DANH MỤC QUẢN TRỊ
        </Typography>

        <List component="nav" disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {roleMenu.map((item: DashboardMenuItem) => {
            const IconComp = item.icon;
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isSubOpen = Boolean(openSubMenus[item.id]);

            const isParentActive =
              hasChildren
                ? item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href))
                : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            if (hasChildren) {
              return (
                <React.Fragment key={item.id}>
                  <ListItemButton
                    onClick={() => toggleSubMenu(item.id)}
                    sx={{
                      borderRadius: "0px",
                      py: 1.25,
                      px: 2,
                      bgcolor: isParentActive ? "action.selected" : "transparent",
                      color: isParentActive ? "text.primary" : "text.secondary",
                      borderLeft: isParentActive ? "3px solid" : "3px solid transparent",
                      borderColor: isParentActive ? "primary.main" : "transparent",
                      "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                      <IconComp sx={{ fontSize: 21 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isParentActive ? 700 : 500,
                        fontFamily: "var(--font-body)",
                      }}
                    />
                    {isSubOpen ? <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} /> : <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />}
                  </ListItemButton>

                  <Collapse in={isSubOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.25, mt: 0.25 }}>
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href || (child.href !== "/admin" && pathname.startsWith(child.href));
                        const ChildIcon = child.icon;

                        return (
                          <ListItemButton
                            key={child.id}
                            onClick={() => {
                              router.push(child.href);
                              setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: "0px",
                              py: 1,
                              pl: 4,
                              pr: 2,
                              bgcolor: isChildActive ? "action.selected" : "transparent",
                              color: isChildActive ? "text.primary" : "text.secondary",
                              borderLeft: isChildActive ? "3px solid" : "3px solid transparent",
                              borderColor: isChildActive ? "primary.main" : "transparent",
                              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
                              <ChildIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: "0.8125rem",
                                fontWeight: isChildActive ? 700 : 500,
                                fontFamily: "var(--font-body)",
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            return (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "0px",
                  py: 1.25,
                  px: 2,
                  bgcolor: isParentActive ? "action.selected" : "transparent",
                  color: isParentActive ? "text.primary" : "text.secondary",
                  borderLeft: isParentActive ? "3px solid" : "3px solid transparent",
                  borderColor: isParentActive ? "primary.main" : "transparent",
                  "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                  <IconComp sx={{ fontSize: 21 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isParentActive ? 700 : 500,
                    fontFamily: "var(--font-body)",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Bottom User Info */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600 }}>
          Vai trò: {user?.role || "GUEST"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          height: HEADER_HEIGHT,
          borderRadius: "0px",
          justifyContent: "center",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: "none" }, borderRadius: "0px" }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ fontWeight: 800, fontFamily: "var(--font-heading)", fontSize: { xs: "1rem", sm: "1.125rem" } }}
            >
              Hệ Thống Quản Trị Cinema
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => setScanDialogOpen(true)} title="Quét vé QR" size="small" sx={{ borderRadius: "0px" }}>
              <QrCodeScannerIcon sx={{ fontSize: 21 }} color="action" />
            </IconButton>

            <ThemeToggle />
            <AdminNotificationBell role={user?.role} />

            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", p: 0.5, borderRadius: "0px" }}
            >
              <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "0.9375rem", fontWeight: 700 }}>
                {getInitials(user?.fullName)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user?.fullName || "Quản trị viên"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role || "ADMIN"}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 1,
                sx: {
                  mt: 1,
                  borderRadius: "2px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: "error.main", borderRadius: "0px" }}>
                <LogoutIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box", borderRadius: "0px" },
          }}
        >
          {renderSidebarContent()}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              borderRadius: "0px",
            },
          }}
          open
        >
          {renderSidebarContent()}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          mt: `${HEADER_HEIGHT}px`,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>

      {/* QR Ticket Scan Dialog */}
      <QrScannerModal
        open={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
      />
    </Box>
  );
}
