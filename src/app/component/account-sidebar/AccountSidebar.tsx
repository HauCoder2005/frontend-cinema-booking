"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { UserRound, LockKeyhole, Ticket, Camera } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar as AvatarModel } from "@/types/data/user/avatar";

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      notify.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      notify.error("Ảnh không được vượt quá 1MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsUploading(true);
      await AvatarModel.uploadAvatar(file);
      notify.success("Cập nhật avatar thành công");
      await refreshUser?.();
    } catch (error) {
      console.error(error);
      notify.error("Cập nhật avatar thất bại");
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const avatarSrc = avatarPreview
    ? avatarPreview
    : user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.avatar}`
      : null;

  const navItems = [
    {
      label: "Thông tin tài khoản",
      href: "/profile",
      icon: <UserRound size={18} />,
      active: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
    {
      label: "Đổi mật khẩu",
      href: "/change-password",
      icon: <LockKeyhole size={18} />,
      active: pathname === "/change-password" || pathname.startsWith("/change-password/"),
    },
    {
      label: "Vé của tôi",
      href: "/my-tickets",
      icon: <Ticket size={18} />,
      active: pathname === "/my-tickets" || pathname.startsWith("/my-tickets/"),
    },
  ];

  return (
    <aside style={{ width: "100%" }}>
      {/* User info header card */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #2A2F37",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 0,
              border: "1px solid #2A2F37",
              backgroundColor: "#15181D",
              overflow: "hidden",
              flexShrink: 0,
              cursor: isUploading ? "default" : "pointer",
              position: "relative",
            }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            title="Thay đổi ảnh đại diện"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: isUploading ? 0.5 : 1,
                  transition: "opacity 200ms ease",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #FF1F2D 0%, #E31320 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                }}
              >
                {getInitials(user?.fullName)}
              </div>
            )}

            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.6)",
                }}
              >
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              </div>
            )}

            {!isUploading && (
              <div
                className="sidebar-avatar-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  opacity: 0,
                  transition: "opacity 200ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0";
                }}
              >
                <Camera size={16} style={{ color: "#fff" }} />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleChangeAvatar}
              disabled={isUploading}
            />
          </div>

          {/* Name & email */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#F5F7FA",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.fullName || "Chưa cập nhật"}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#747C88",
                margin: "2px 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "Chưa có email"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Navigation */}
      <nav style={{ padding: "12px 0" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#747C88",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "0 20px",
            margin: "0 0 8px",
          }}
        >
          Tài khoản
        </p>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 20px",
              borderLeft: item.active ? "3px solid #FF1F2D" : "3px solid transparent",
              backgroundColor: item.active ? "rgba(255, 31, 45, 0.08)" : "transparent",
              color: item.active ? "#FF1F2D" : "#A6ADB8",
              fontSize: "13px",
              fontWeight: item.active ? 700 : 500,
              textDecoration: "none",
              transition: "all 150ms ease",
              borderRadius: 0,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
