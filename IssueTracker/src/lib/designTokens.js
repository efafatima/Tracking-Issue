// Design System - Colors, Themes, and Tokens
export const COLORS = {
  // Primary
  darkNavy: "#0F2342",
  uniBlue: "#0F2342",
  
  // Status Colors
  successGreen: "#1D9E75",
  warningAmber: "#BA7517",
  criticalRed: "#A32D2D",
  aiPurple: "#534AB7",
  
  // Surface
  lightBg: "#F6F8FF",
  sidebarBg: "#0F2342",
  
  // Text & Neutral
  white: "#FFFFFF",
  darkText: "#111111",
  mutedText: "#8a8f98",
  border: "#dce3f1",
};

// Role-based color themes
export const ROLE_COLORS = {
  Student: {
    primary: "#0F2342",
    light: "#e8edf4",
    badge: "🔵",
    description: "Issue submission & tracking",
  },
  "Faculty Member": {
    primary: "#534AB7",
    light: "#ede9ff",
    badge: "🟣",
    description: "Assigned issues & resolution",
  },
  HOD: {
    primary: "#1D9E75",
    light: "#e8f5f0",
    badge: "🟢",
    description: "Department management",
  },
  DSA: {
    primary: "#BA7517",
    light: "#fef3e8",
    badge: "🟠",
    description: "Non-academic affairs",
  },
  Supervisor: {
    primary: "#534AB7",
    light: "#ede9ff",
    badge: "🔮",
    description: "Full system oversight",
  },
};

// Issue Status Colors
export const STATUS_COLORS = {
  Open: {
    color: "#0F2342",
    bg: "#e8edf4",
    icon: "⭕",
    label: "Open",
  },
  "In Progress": {
    color: "#BA7517",
    bg: "#fef3e8",
    icon: "🔄",
    label: "In Progress",
  },
  Resolved: {
    color: "#1D9E75",
    bg: "#e8f5f0",
    icon: "✅",
    label: "Resolved",
  },
  Escalated: {
    color: "#A32D2D",
    bg: "#ffe8e8",
    icon: "⚠️",
    label: "Escalated",
  },
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sizes: {
    h1: "2.5rem",
    h2: "2rem",
    h3: "1.5rem",
    body: "1rem",
    small: "0.875rem",
  },
};

// Spacing
export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: "640px",
  tablet: "768px",
  desktop: "1024px",
};
