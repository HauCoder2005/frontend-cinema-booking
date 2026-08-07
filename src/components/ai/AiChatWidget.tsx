"use client";

import React, {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  LogIn,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { useMutation } from "@tanstack/react-query";

import {
  AiChat,
  IAiChatRequest,
} from "@/types/data/ai";

import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: number;

  role: "user" | "assistant";

  content: string;

  action?: "login";
}

const AI_IMAGE_URL =
  "/icons/ai-cinema-booking.png";

/**
 * Các câu hỏi yêu cầu user đăng nhập.
 *
 * Sau này có thể chuyển logic này xuống Backend
 * hoặc để AI Function Calling xử lý.
 */
function requiresAuthentication(
  content: string,
): boolean {
  const text =
    content
      .toLowerCase()
      .trim();

  const bookingKeywords = [
    "đặt vé",
    "mua vé",
    "book vé",
    "booking",
    "chọn ghế",
    "đặt ghế",
    "thanh toán",
    "vé của tôi",
    "lịch sử đặt vé",
  ];

  return bookingKeywords.some(
    (keyword) =>
      text.includes(keyword),
  );
}

export default function AiChatWidget() {
  const router = useRouter();

  const {
    isAuthenticated,
  } = useAuth();

  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>([
      {
        id: 1,

        role: "assistant",

        content:
          "Xin chào 👋\nMình là Cinema AI. Bạn muốn tìm phim, lịch chiếu hay cần hỗ trợ gì?",
      },
    ]);

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /**
   * ==============================
   * AI API
   * ==============================
   *
   * POST /api/client/ai/chat
   */
  const chatMutation =
    useMutation({
      mutationFn: (
        payload: IAiChatRequest,
      ) =>
        AiChat.chat(
          payload,
        ),
    });

  /**
   * Tự động scroll xuống cuối.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      },
    );
  }, [
    messages,
    chatMutation.isPending,
  ]);

  /**
   * ==============================
   * SEND MESSAGE
   * ==============================
   */
  const handleSendMessage =
    async () => {
      const content =
        message.trim();

      if (
        !content ||
        chatMutation.isPending
      ) {
        return;
      }

      /**
       * 1. Hiển thị message user.
       */
      const userMessage: ChatMessage =
        {
          id: Date.now(),

          role: "user",

          content,
        };

      setMessages(
        (current) => [
          ...current,
          userMessage,
        ],
      );

      setMessage("");

      /**
       * ==========================
       * KIỂM TRA AUTH
       * ==========================
       *
       * Chưa login + hỏi chức năng
       * yêu cầu tài khoản.
       */
      if (
        !isAuthenticated &&
        requiresAuthentication(
          content,
        )
      ) {
        const authMessage: ChatMessage =
          {
            id:
              Date.now() +
              1,

            role:
              "assistant",

            content:
              "Để thực hiện đặt vé, chọn ghế hoặc thanh toán, bạn cần đăng nhập vào Cinema Booking trước nhé.",

            action:
              "login",
          };

        setMessages(
          (current) => [
            ...current,
            authMessage,
          ],
        );

        return;
      }

      /**
       * ==========================
       * CALL AI API
       * ==========================
       */
      try {
        console.log(
          "Calling Cinema AI:",
          content,
        );

        const response =
          await chatMutation.mutateAsync(
            {
              message:
                content,
            },
          );

        console.log(
          "Cinema AI response:",
          response,
        );

        const aiMessage: ChatMessage =
          {
            id:
              Date.now() +
              1,

            role:
              "assistant",

            content:
              response.data
                ?.message ||
              "Mình chưa nhận được câu trả lời.",
          };

        setMessages(
          (current) => [
            ...current,
            aiMessage,
          ],
        );
      } catch (error) {
        console.error(
          "Cinema AI request failed:",
          error,
        );

        setMessages(
          (current) => [
            ...current,

            {
              id:
                Date.now() +
                1,

              role:
                "assistant",

              content:
                "Xin lỗi, Cinema AI đang gặp sự cố kết nối. Bạn thử lại sau nhé.",
            },
          ],
        );
      }
    };

  /**
   * Enter = gửi
   *
   * Shift + Enter = xuống dòng
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSendMessage();
    }
  };

  /**
   * Điều hướng sang Login.
   */
  const handleLogin =
    () => {
      router.push(
        "/login",
      );
    };

  return (
    <>
      {/* =========================
          CHAT WINDOW
      ========================== */}

      {open && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            inset: { xs: 0, sm: "auto" },
            right: { xs: 0, sm: 28 },
            bottom: { xs: 0, sm: 112 },
            width: { xs: "100%", sm: 400 },
            maxWidth: { xs: "none", sm: 400 },
            height: { xs: "100dvh", sm: 560 },
            maxHeight: { xs: "100dvh", sm: 620 },
            zIndex: 1500,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "background.paper",
            border: { xs: "none", sm: "1px solid" },
            borderColor: "divider",
            borderRadius: { xs: 0, sm: "6px" },
            pb: { xs: "env(safe-area-inset-bottom)", sm: 0 },
            pt: { xs: "env(safe-area-inset-top)", sm: 0 },

            boxShadow:
              "0 24px 70px rgba(0,0,0,0.46)",

            transformOrigin:
              "bottom right",

            animation:
              "cinemaAiOpen 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",

            "@keyframes cinemaAiOpen":
              {
                from: {
                  opacity: 0,

                  transform:
                    "translateY(14px) scale(0.96)",
                },

                to: {
                  opacity: 1,

                  transform:
                    "translateY(0) scale(1)",
                },
              },
          }}
        >
          {/* =========================
              HEADER
          ========================== */}

          <Box
            sx={{
              minHeight:
                68,

              px: 2,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              flexShrink:
                0,

              borderBottom:
                "1px solid",

              borderColor:
                "divider",

              bgcolor: (
                theme,
              ) =>
                theme
                  .palette
                  .mode ===
                "dark"
                  ? "#0D0F12"
                  : "#FFFFFF",
            }}
          >
            <Box
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: 1.2,
              }}
            >
              <Box
                sx={{
                  position:
                    "relative",

                  width: 46,
                  height: 46,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",
                }}
              >
                <Box
                  sx={{
                    position:
                      "absolute",

                    inset: 5,

                    bgcolor:
                      "primary.main",

                    opacity:
                      0.13,

                    borderRadius:
                      "50%",

                    filter:
                      "blur(10px)",
                  }}
                />

                <Image
                  src={
                    AI_IMAGE_URL
                  }

                  alt="Cinema AI"

                  width={46}
                  height={46}

                  style={{
                    position:
                      "relative",

                    width:
                      "46px",

                    height:
                      "46px",

                    objectFit:
                      "contain",
                  }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 0.6,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize:
                        15,

                      fontWeight:
                        800,
                    }}
                  >
                    Cinema AI
                  </Typography>

                  <Sparkles
                    size={14}
                  />
                </Box>

                <Box
                  sx={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 0.7,

                    mt: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,

                      bgcolor:
                        "#22C55E",

                      borderRadius:
                        "50%",

                      boxShadow:
                        "0 0 7px rgba(34,197,94,.7)",
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Trợ lý Cinema
                    Booking
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              size="small"

              onClick={() =>
                setOpen(false)
              }

              sx={{
                color:
                  "text.secondary",

                "&:hover":
                  {
                    color:
                      "text.primary",

                    transform:
                      "rotate(90deg)",
                  },

                transition:
                  "all 160ms ease",
              }}
            >
              <X
                size={19}
              />
            </IconButton>
          </Box>

          {/* =========================
              MESSAGES
          ========================== */}

          <Box
            sx={{
              flex: 1,

              px: 2,

              py: 2,

              overflowY:
                "auto",

              bgcolor: (
                theme,
              ) =>
                theme
                  .palette
                  .mode ===
                "dark"
                  ? "#090B0E"
                  : "#F7F7F8",

              "&::-webkit-scrollbar":
                {
                  width: 5,
                },

              "&::-webkit-scrollbar-thumb":
                {
                  bgcolor:
                    "divider",

                  borderRadius:
                    10,
                },
            }}
          >
            {messages.map(
              (item) => {
                const isUser =
                  item.role ===
                  "user";

                return (
                  <Box
                    key={
                      item.id
                    }

                    sx={{
                      width:
                        "100%",

                      mb: 1.7,

                      display:
                        "flex",

                      alignItems:
                        "flex-start",

                      justifyContent:
                        isUser
                          ? "flex-end"
                          : "flex-start",

                      animation:
                        "chatMessageIn 180ms ease",

                      "@keyframes chatMessageIn":
                        {
                          from: {
                            opacity:
                              0,

                            transform:
                              "translateY(6px)",
                          },

                          to: {
                            opacity:
                              1,

                            transform:
                              "translateY(0)",
                          },
                        },
                    }}
                  >
                    {!isUser && (
                      <Box
                        sx={{
                          width:
                            30,

                          height:
                            30,

                          mr: 1,

                          mt: 0.2,

                          flexShrink:
                            0,
                        }}
                      >
                        <Image
                          src={
                            AI_IMAGE_URL
                          }

                          alt="Cinema AI"

                          width={
                            30
                          }

                          height={
                            30
                          }

                          style={{
                            width:
                              "30px",

                            height:
                              "30px",

                            objectFit:
                              "contain",
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      sx={{
                        maxWidth:
                          "80%",
                      }}
                    >
                      {/* MESSAGE */}

                      <Box
                        sx={{
                          px: 1.6,

                          py: 1.15,

                          bgcolor:
                            isUser
                              ? "primary.main"
                              : "background.paper",

                          color:
                            isUser
                              ? "primary.contrastText"
                              : "text.primary",

                          border:
                            isUser
                              ? "none"
                              : "1px solid",

                          borderColor:
                            "divider",

                          borderRadius:
                            isUser
                              ? "8px 2px 8px 8px"
                              : "2px 8px 8px 8px",
                        }}
                      >
                        <Typography
                          variant="body2"

                          sx={{
                            lineHeight:
                              1.65,

                            whiteSpace:
                              "pre-wrap",

                            wordBreak:
                              "break-word",
                          }}
                        >
                          {
                            item.content
                          }
                        </Typography>
                      </Box>

                      {/* =========================
                          LOGIN ACTION
                      ========================== */}

                      {item.action ===
                        "login" && (
                        <Box
                          component="button"

                          type="button"

                          onClick={
                            handleLogin
                          }

                          sx={{
                            mt: 1,

                            width:
                              "100%",

                            minHeight:
                              40,

                            px: 2,

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            gap: 1,

                            bgcolor:
                              "primary.main",

                            color:
                              "primary.contrastText",

                            border:
                              "1px solid",

                            borderColor:
                              "primary.main",

                            borderRadius:
                              "3px",

                            fontFamily:
                              "inherit",

                            fontSize:
                              13,

                            fontWeight:
                              700,

                            cursor:
                              "pointer",

                            transition:
                              "all 160ms ease",

                            "&:hover":
                              {
                                bgcolor:
                                  "primary.dark",

                                transform:
                                  "translateY(-1px)",
                              },
                          }}
                        >
                          <LogIn
                            size={
                              16
                            }
                          />

                          Đăng nhập
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              },
            )}

            {/* =========================
                THINKING
            ========================== */}

            {chatMutation.isPending && (
              <Box
                sx={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 30,

                    height:
                      30,

                    animation:
                      "aiThinking 700ms ease-in-out infinite alternate",

                    "@keyframes aiThinking":
                      {
                        from: {
                          transform:
                            "translateY(0) rotate(-3deg)",
                        },

                        to: {
                          transform:
                            "translateY(-3px) rotate(3deg)",
                        },
                      },
                  }}
                >
                  <Image
                    src={
                      AI_IMAGE_URL
                    }

                    alt="Cinema AI"

                    width={30}

                    height={
                      30
                    }
                  />
                </Box>

                <Box
                  sx={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 1,

                    px: 1.5,

                    py: 1.05,

                    bgcolor:
                      "background.paper",

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "2px 8px 8px 8px",
                  }}
                >
                  <CircularProgress
                    size={13}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Cinema AI
                    đang suy
                    nghĩ...
                  </Typography>
                </Box>
              </Box>
            )}

            <div
              ref={bottomRef}
            />
          </Box>

          {/* =========================
              INPUT
          ========================== */}

          <Box
            sx={{
              p: 1.4,

              display:
                "flex",

              alignItems:
                "flex-end",

              gap: 1,

              borderTop:
                "1px solid",

              borderColor:
                "divider",
            }}
          >
            <TextField
              fullWidth

              multiline

              maxRows={4}

              value={
                message
              }

              disabled={
                chatMutation.isPending
              }

              placeholder="Nhập câu hỏi cho Cinema AI..."

              onChange={(
                event,
              ) =>
                setMessage(
                  event
                    .target
                    .value,
                )
              }

              onKeyDown={
                handleKeyDown
              }

              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    minHeight:
                      44,

                    borderRadius:
                      "3px",
                  },

                "& textarea":
                  {
                    fontSize:
                      14,
                  },
              }}
            />

            <IconButton
              aria-label="Gửi tin nhắn"

              disabled={
                !message.trim() ||
                chatMutation.isPending
              }

              onClick={() =>
                void handleSendMessage()
              }

              sx={{
                width: 44,

                height:
                  44,

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                borderRadius:
                  "3px",

                "&:hover":
                  {
                    bgcolor:
                      "primary.dark",

                    transform:
                      "translateY(-2px)",
                  },

                "&.Mui-disabled":
                  {
                    bgcolor:
                      "action.disabledBackground",
                  },

                transition:
                  "all 160ms ease",
              }}
            >
              {chatMutation.isPending ? (
                <CircularProgress
                  size={17}

                  color="inherit"
                />
              ) : (
                <Send
                  size={
                    18
                  }
                />
              )}
            </IconButton>
          </Box>

          <Box
            sx={{
              px: 1.8,

              pb: 1.2,
            }}
          >
            <Typography
              variant="caption"

              color="text.disabled"
            >
              Enter để gửi •
              Shift + Enter để
              xuống dòng
            </Typography>
          </Box>
        </Paper>
      )}

      {/* =========================
          FLOATING MASCOT
      ========================== */}

      <Box
        component="button"

        type="button"

        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }

        sx={{
          position:
            "fixed",

          right: {
            xs: 14,

            sm: 26,
          },

          bottom: {
            xs: 14,

            sm: 24,
          },

          zIndex:
            1501,

          width: 88,

          height: 88,

          p: 0,

          border:
            "none",

          bgcolor:
            "transparent",

          cursor:
            "pointer",

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          animation:
            open
              ? "none"
              : "mascotFloat 3s ease-in-out infinite",

          "@keyframes mascotFloat":
            {
              "0%, 100%":
                {
                  transform:
                    "translateY(0)",
                },

              "50%":
                {
                  transform:
                    "translateY(-7px)",
                },
            },

          "&:hover":
            {
              animation:
                "none",

              transform:
                "translateY(-6px) scale(1.07)",
            },
        }}
      >
        <Box
          sx={{
            position:
              "absolute",

            width: 70,

            height:
              70,

            bgcolor:
              "primary.main",

            opacity:
              0.18,

            borderRadius:
              "50%",

            filter:
              "blur(18px)",
          }}
        />

        <Image
          src={
            AI_IMAGE_URL
          }

          alt="Cinema AI"

          width={82}

          height={82}

          priority

          style={{
            position:
              "relative",

            width:
              "82px",

            height:
              "82px",

            objectFit:
              "contain",

            filter:
              "drop-shadow(0 9px 15px rgba(0,0,0,.35))",
          }}
        />

        <Box
          sx={{
            position:
              "absolute",

            right: 4,

            bottom: 7,

            width: 13,

            height:
              13,

            bgcolor:
              "#22C55E",

            border:
              "2px solid",

            borderColor:
              "background.default",

            borderRadius:
              "50%",

            boxShadow:
              "0 0 8px rgba(34,197,94,.8)",
          }}
        />
      </Box>
    </>
  );
}