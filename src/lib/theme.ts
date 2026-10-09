/**
 * Prawira POS - Design System Tokens
 * Industrial Retail POS Cockpit Standard
 */

export const THEME = {
  colors: {
    // Canvas & Surfaces
    canvas: "#06090f",
    surfaceBase: "#0a0f18",
    surfaceCard: "#101726",
    surfaceElevated: "#151f33",
    surfaceActive: "#1c2842",
    
    // Borders
    border: "#1e2b42",
    borderSubtle: "#141c2c",
    borderHighlight: "#2e4163",

    // Primary Accents (Indigo / Cobalt)
    primary: "#4f46e5",
    primaryLight: "#6366f1",
    primaryMuted: "#818cf8",
    primaryTint: "rgba(99, 102, 241, 0.12)",
    primaryBorder: "rgba(99, 102, 241, 0.3)",

    // Signal Emerald (Pay CTA, Online status, Success)
    emerald: "#10b981",
    emeraldDark: "#059669",
    emeraldReceipt: "#047857",
    emeraldLight: "#34d399",
    emeraldTint: "rgba(16, 185, 129, 0.12)",
    emeraldBorder: "rgba(16, 185, 129, 0.3)",
    emeraldGlow: "rgba(16, 185, 129, 0.35)",

    // WhatsApp brand
    whatsapp: "#25d366",

    // Signal Amber (Favorites, Discounts, Torch, Alerts)
    amber: "#f59e0b",
    amberLight: "#fbbf24",
    amberTint: "rgba(245, 158, 11, 0.14)",
    amberBorder: "rgba(245, 158, 11, 0.35)",

    // Signal Danger (Deficit, Remove, Clear)
    danger: "#ef4444",
    dangerLight: "#f87171",
    dangerTint: "rgba(239, 68, 68, 0.12)",
    dangerBorder: "rgba(239, 68, 68, 0.3)",

    // Text Hierarchy
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textTertiary: "#475569",
    textInverse: "#ffffff",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  typography: {
    display: {
      fontSize: 28,
      fontWeight: "800" as const,
      letterSpacing: -0.5,
    },
    headline: {
      fontSize: 20,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 16,
      fontWeight: "700" as const,
    },
    bodyLarge: {
      fontSize: 14,
      fontWeight: "600" as const,
    },
    body: {
      fontSize: 13,
      fontWeight: "500" as const,
    },
    caption: {
      fontSize: 11,
      fontWeight: "600" as const,
      letterSpacing: 0.3,
    },
    badge: {
      fontSize: 10,
      fontWeight: "700" as const,
      letterSpacing: 0.6,
    },
  },
} as const;
