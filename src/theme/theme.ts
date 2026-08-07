import { createTheme, ThemeOptions } from "@mui/material/styles";

type ThemeMode = "light" | "dark";

const COLORS = {
  primary: {
    main: "#FF1F2D",
    light: "#FF4D57",
    dark: "#E31320",
  },
  secondary: {
    main: "#E31320",
    light: "#FF4D57",
    dark: "#C90F1A",
  },
  error: {
    main: "#FF1F2D",
    light: "#FF4D57",
    dark: "#E31320",
  },
  warning: {
    main: "#F59E0B",
    light: "#FBBF24",
    dark: "#D97706",
  },
  info: {
    main: "#38BDF8",
    light: "#7DD3FC",
    dark: "#0284C7",
  },
  success: {
    main: "#22C55E",
    light: "#4ADE80",
    dark: "#15803D",
  },
} as const;

const getThemeOptions = (mode: ThemeMode): ThemeOptions => {
  const isDark = mode === "dark";

  const backgroundDefault = isDark ? "#08090B" : "#F5F7FA";
  const backgroundPaper = isDark ? "#15181D" : "#FFFFFF";

  const textPrimary = isDark ? "#F5F7FA" : "#18181B";
  const textSecondary = isDark ? "#A6ADB8" : "#52525B";
  const textDisabled = isDark ? "#747C88" : "#A1A1AA";

  const divider = isDark
    ? "rgba(255, 255, 255, 0.10)"
    : "rgba(24, 24, 27, 0.12)";

  const hoverBackground = isDark
    ? "rgba(255, 31, 45, 0.12)"
    : "rgba(255, 31, 45, 0.08)";

  return {
    palette: {
      mode,

      primary: {
        ...COLORS.primary,
        contrastText: "#ffffff",
      },

      secondary: {
        ...COLORS.secondary,
        contrastText: "#ffffff",
      },

      error: COLORS.error,
      warning: COLORS.warning,
      info: COLORS.info,
      success: COLORS.success,

      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },

      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: textDisabled,
      },

      divider,

      action: {
        active: textSecondary,
        hover: hoverBackground,
        selected: isDark
          ? "rgba(255, 31, 45, 0.16)"
          : "rgba(255, 31, 45, 0.10)",
        disabled: textDisabled,
        disabledBackground: isDark
          ? "rgba(255, 255, 255, 0.06)"
          : "rgba(24, 24, 27, 0.04)",
      },
    },

    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 700 },
    },

    shape: {
      borderRadius: 2,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: backgroundDefault,
            color: textPrimary,
            minHeight: "100vh",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: "2px",
            borderColor: divider,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "2px",
            backgroundImage: "none",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "2px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },

      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: "1.25rem",
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: textSecondary,
          },
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: textSecondary,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: "2px",
            color: textSecondary,
            "&:hover": {
              color: textPrimary,
              backgroundColor: hoverBackground,
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: "2px",
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "2px",
            backgroundImage: "none",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "2px",
            fontWeight: 700,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: divider,
            padding: "12px 16px",
          },
          head: {
            fontWeight: 700,
            backgroundColor: isDark ? "#15181D" : "#FAFAFA",
            color: textPrimary,
          },
        },
      },
    },
  };
};

export const createAppTheme = (mode: ThemeMode) => {
  return createTheme(getThemeOptions(mode));
};

export const lightTheme = createAppTheme("light");
export const darkTheme = createAppTheme("dark");