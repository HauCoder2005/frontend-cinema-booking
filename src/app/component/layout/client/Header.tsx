/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { UserRound, LockKeyhole, Ticket, ShieldCheck, LogOut } from "lucide-react";

import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { notify } from "@/lib/notifications";

interface NavigationItem {
  label: string;
  href: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Trang chủ",
    href: "/",
  },
  {
    label: "Phim",
    href: "/movies",
  },
  {
    label: "Rạp chiếu",
    href: "/cinemas",
  },
  {
    label: "Tin tức",
    href: "/news",
  },
];

function resolveAvatarUrl(
  imageBaseUrl: string,
  avatarUrl: string | undefined,
): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  if (
    avatarUrl.startsWith("http://") ||
    avatarUrl.startsWith("https://")
  ) {
    return avatarUrl;
  }

  if (!imageBaseUrl) {
    return avatarUrl.startsWith("/")
      ? avatarUrl
      : `/${avatarUrl}`;
  }

  return `${imageBaseUrl}/${avatarUrl.replace(/^\//, "")}`;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(null);

  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ?? "";

  const avatarUrl = resolveAvatarUrl(
    imageBaseUrl,
    user?.avatar,
  );

  const isUserMenuOpen = Boolean(anchorEl && user);

  const getInitials = (name?: string): string => {
    if (!name?.trim()) {
      return "U";
    }

    return name.trim().charAt(0).toUpperCase();
  };

  const isNavigationActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const handleUserMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    handleCloseMobileMenu();

    await logout();
    notify.success("Đăng xuất thành công!");
    router.push("/login");
  };

  const handleProfile = () => {
    handleUserMenuClose();
    router.push("/profile");
  };

  const handleMyTickets = () => {
    handleUserMenuClose();
    router.push("/my-tickets");
  };

  const handleAdmin = () => {
    handleUserMenuClose();

    if (
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.MANAGER
    ) {
      router.push("/admin");
      return;
    }

    if (user?.role === UserRole.STAFF) {
      router.push("/admin/staff-schedules/my/request");
    }
  };

  const renderUserMenuItems = (): React.ReactNode[] => {
    if (!user) {
      return [];
    }

    const menuItems: React.ReactNode[] = [];

    // Header card inside user dropdown
    menuItems.push(
      <Box
        key="user-header"
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: 0.5,
        }}
      >
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {user.fullName || "Khách hàng"}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ color: "text.secondary", display: "block" }}
        >
          {user.email || ""}
        </Typography>
      </Box>,
    );

    menuItems.push(
      <MenuItem
        key="profile"
        component={Link}
        href="/profile"
        onClick={handleUserMenuClose}
        aria-label="Thông tin tài khoản"
        sx={{
          minHeight: 42,
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 0,
          bgcolor: pathname === "/profile" ? "rgba(255, 31, 45, 0.08)" : "transparent",
          color: pathname === "/profile" ? "#FF1F2D" : "text.primary",
        }}
      >
        <UserRound size={18} style={{ color: pathname === "/profile" ? "#FF1F2D" : "inherit" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
          Thông tin tài khoản
        </Typography>
      </MenuItem>,

      <MenuItem
        key="change-password"
        component={Link}
        href="/change-password"
        onClick={handleUserMenuClose}
        aria-label="Đổi mật khẩu"
        sx={{
          minHeight: 42,
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 0,
          bgcolor: pathname === "/change-password" ? "rgba(255, 31, 45, 0.08)" : "transparent",
          color: pathname === "/change-password" ? "#FF1F2D" : "text.primary",
        }}
      >
        <LockKeyhole size={18} style={{ color: pathname === "/change-password" ? "#FF1F2D" : "inherit" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
          Đổi mật khẩu
        </Typography>
      </MenuItem>,

      <MenuItem
        key="my-tickets"
        component={Link}
        href="/my-tickets"
        onClick={handleUserMenuClose}
        aria-label="Vé của tôi"
        sx={{
          minHeight: 42,
          gap: 1.5,
          px: 2,
          py: 1,
          borderRadius: 0,
          bgcolor: pathname === "/my-tickets" ? "rgba(255, 31, 45, 0.08)" : "transparent",
          color: pathname === "/my-tickets" ? "#FF1F2D" : "text.primary",
        }}
      >
        <Ticket size={18} style={{ color: pathname === "/my-tickets" ? "#FF1F2D" : "inherit" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
          Vé của tôi
        </Typography>
      </MenuItem>,
    );

    if (user.role !== UserRole.CLIENT) {
      menuItems.push(
        <MenuItem
          key="admin"
          onClick={handleAdmin}
          aria-label="Trang quản lý"
          sx={{
            minHeight: 42,
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 0,
          }}
        >
          <ShieldCheck size={18} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
            Trang quản lý
          </Typography>
        </MenuItem>,
      );
    }

    menuItems.push(
      <MenuItem
        key="logout"
        onClick={handleLogout}
        aria-label="Đăng xuất"
        sx={{
          minHeight: 42,
          gap: 1.5,
          px: 2,
          py: 1,
          color: "error.main",
          borderRadius: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          mt: 0.5,
        }}
      >
        <LogOut size={18} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
          Đăng xuất
        </Typography>
      </MenuItem>,
    );

    return menuItems;
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        width: "100%",
        color: "text.primary",
        bgcolor: (theme) =>
          alpha(theme.palette.background.paper, 0.94),
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(14px)",
        transition:
          "background-color 180ms ease, border-color 180ms ease",
      }}
    >
      <Container maxWidth="xl">
        {/* Thanh điều hướng chính */}
        <Box
          sx={{
            minHeight: 72,
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 2,
              lg: 4,
            },
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            aria-label="Về trang chủ"
            sx={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "transform 180ms ease",

              "&:hover": {
                transform: "scale(1.025)",
              },

              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <Box
              component="img"
              src="/logo/logo_cinema.png"
              alt="Cinema Logo"
              sx={{
                width: "auto",
                height: {
                  xs: 42,
                  md: 48,
                },
                display: "block",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Navigation desktop */}
          <Box
            component="nav"
            aria-label="Điều hướng chính"
            sx={{
              display: {
                xs: "none",
                lg: "flex",
              },
              alignItems: "center",
              gap: 1,
            }}
          >
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = isNavigationActive(item.href);

              return (
                <Box
                  component={Link}
                  key={item.href}
                  href={item.href}
                  sx={{
                    position: "relative",
                    minHeight: 44,
                    px: 1.75,
                    display: "inline-flex",
                    alignItems: "center",
                    color: isActive
                      ? "primary.main"
                      : "text.primary",
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "color 180ms ease",

                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: 14,
                      bottom: 5,
                      left: 14,
                      height: 2,
                      bgcolor: "primary.main",
                      transform: isActive
                        ? "scaleX(1)"
                        : "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 180ms ease",
                    },

                    "&:hover": {
                      color: "primary.main",
                    },

                    "&:hover::after": {
                      transform: "scaleX(1)",
                    },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>

          {/* Khu vực bên phải desktop */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              display: {
                xs: "none",
                md: "flex",
              },
              ml: "auto",
            }}
          >
            <ThemeToggle />

            {isAuthenticated && user ? (
              <Box
                onClick={handleUserMenuOpen}
                sx={{
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  cursor: "pointer",
                  color: "text.primary",
                }}
              >
                <IconButton
                  size="small"
                  aria-controls={
                    isUserMenuOpen ? "user-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={
                    isUserMenuOpen ? "true" : undefined
                  }
                  sx={{
                    p: 0,
                    color: "text.primary",
                  }}
                >
                  <Avatar
                    src={avatarUrl}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(
                      user.fullName || user.email,
                    )}
                  </Avatar>
                </IconButton>

                <Box
                  sx={{
                    display: {
                      md: "none",
                      lg: "flex",
                    },
                    minWidth: 0,
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      maxWidth: 180,
                      color: "text.primary",
                      fontWeight: 700,
                      lineHeight: 1.25,
                    }}
                  >
                    {user.fullName || user.email}
                  </Typography>

                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      maxWidth: 180,
                      color: "text.secondary",
                      fontWeight: 500,
                      lineHeight: 1.25,
                    }}
                  >
                    {user.role === UserRole.CLIENT
                      ? "Khách hàng"
                      : user.role}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  size="medium"
                  sx={{
                    minHeight: 42,
                    px: 2.5,
                    color: "text.primary",
                    borderColor: "divider",
                    borderRadius: 0,
                    textDecoration: "none",

                    "&:hover": {
                      color: "primary.main",
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  Đăng nhập
                </Button>

                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{
                    minHeight: 42,
                    px: 2.5,
                    borderRadius: 0,
                    textDecoration: "none",
                  }}
                >
                  Đăng ký
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Khu vực mobile */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
              ml: "auto",
            }}
          >
            <ThemeToggle />

            <IconButton
              onClick={() =>
                setIsMobileOpen((currentValue) => !currentValue)
              }
              aria-label={
                isMobileOpen
                  ? "Đóng menu điều hướng"
                  : "Mở menu điều hướng"
              }
              aria-expanded={isMobileOpen}
              sx={{
                color: "text.primary",
              }}
            >
              {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Box>

        {/* Điều hướng mobile */}
        {isMobileOpen && (
          <Box
            sx={{
              display: {
                xs: "block",
                md: "none",
              },
              pb: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              component="nav"
              aria-label="Điều hướng trên thiết bị di động"
              sx={{
                display: "flex",
                flexDirection: "column",
                py: 1,
              }}
            >
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = isNavigationActive(item.href);

                return (
                  <Box
                    component={Link}
                    key={item.href}
                    href={item.href}
                    onClick={handleCloseMobileMenu}
                    sx={{
                      minHeight: 46,
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      color: isActive
                        ? "primary.main"
                        : "text.primary",
                      borderLeft: "3px solid",
                      borderColor: isActive
                        ? "primary.main"
                        : "transparent",
                      bgcolor: isActive
                        ? "action.selected"
                        : "transparent",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",

                      "&:hover": {
                        color: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>

            <Box
              sx={{
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {isAuthenticated && user ? (
                <Stack spacing={1}>
                  <Box
                    sx={{
                      px: 1,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                    }}
                  >
                    <Avatar
                      src={avatarUrl}
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(
                        user.fullName || user.email,
                      )}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          color: "text.primary",
                          fontWeight: 700,
                        }}
                      >
                        {user.fullName || user.email}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        {user.role === UserRole.CLIENT
                          ? "Khách hàng"
                          : user.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UserRound size={18} />}
                    onClick={() => {
                      handleCloseMobileMenu();
                      router.push("/profile");
                    }}
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    Thông tin tài khoản
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LockKeyhole size={18} />}
                    onClick={() => {
                      handleCloseMobileMenu();
                      router.push("/change-password");
                    }}
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    Đổi mật khẩu
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Ticket size={18} />}
                    onClick={() => {
                      handleCloseMobileMenu();
                      router.push("/my-tickets");
                    }}
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    Vé của tôi
                  </Button>

                  {user.role !== UserRole.CLIENT && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShieldCheck size={18} />}
                      onClick={() => {
                        handleCloseMobileMenu();
                        handleAdmin();
                      }}
                      sx={{
                        minHeight: 44,
                        borderRadius: 0,
                        justifyContent: "flex-start",
                      }}
                    >
                      Trang quản lý
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<LogOut size={18} />}
                    onClick={handleLogout}
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    Đăng xuất
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    href="/login"
                    fullWidth
                    variant="outlined"
                    onClick={handleCloseMobileMenu}
                    sx={{
                      minHeight: 44,
                      color: "text.primary",
                      borderRadius: 0,
                      textDecoration: "none",
                    }}
                  >
                    Đăng nhập
                  </Button>

                  <Button
                    component={Link}
                    href="/register"
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleCloseMobileMenu}
                    sx={{
                      minHeight: 44,
                      borderRadius: 0,
                      textDecoration: "none",
                    }}
                  >
                    Đăng ký
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Container>

      {/* Menu tài khoản */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              p: 0.5,
              color: "text.primary",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 14px 36px rgba(0, 0, 0, 0.5)"
                  : "0 14px 36px rgba(15, 23, 42, 0.14)",
            },
          },
        }}
      >
        {renderUserMenuItems()}
      </Menu>
    </Box>
  );
}