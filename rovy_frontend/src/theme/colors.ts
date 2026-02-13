export const colors = {
  background: "#0b0b0b",
  surface: "#1a1a1a",
  primary: "#ffffff",
  text: {
    primary: "#ffffff",
    secondary: "#888888",
    muted: "#666666",
  },
  border: "#333333",
  borderLight: "rgba(255, 255, 255, 0.1)",
  error: "#ff4444",
  dashboard: {
    coPilot: "#FF6B6B", // Softer Red
    campfire: "#4ECDC4", // Teal/Green
    build: "#FFA07A", // Light Salmon/Orange
    text: "#FFFFFF",
    glassBorder: "rgba(255, 255, 255, 0.15)",
    glassBg: "rgba(0, 0, 0, 0.3)",
    activeTab: "rgba(255, 255, 255, 0.1)",
  },
  radar: {
    background: "#1C1C1E",
    ghost: "rgba(255, 255, 255, 0.1)",
    beacon: "#0A84FF",
    sos: "#FF453A",
    safe: "#64D2FF",
    signal: {
      good: "#30D158",
      fair: "#FFD60A",
      poor: "#FF453A",
    }
  }
} as const;
