import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#F7F7FA",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#E6E8F0",
    textSecondary: "#60646C",
    borde: "#E0E1E6",
    primario: "#5B3DF5",
    primarioSuave: "#ECE8FF",
    sobrePrimario: "#FFFFFF",
    peligro: "#D93036",
    exito: "#1F9D55",
  },
  dark: {
    text: "#ECEDEE",
    background: "#0B0B0F",
    backgroundElement: "#18181D",
    backgroundSelected: "#2E3135",
    textSecondary: "#A0A4AB",
    borde: "#2C2C33",
    primario: "#8B75FF",
    primarioSuave: "#2A2350",
    sobrePrimario: "#FFFFFF",
    peligro: "#FF6369",
    exito: "#3DD68C",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Cada estado de una compra tiene su color, para distinguirlos de un vistazo
export const ColoresEstado = {
  PENDIENTE: { fondo: "#FFF4D6", texto: "#8A5A00" },
  CONFIRMADA: { fondo: "#DDF6E8", texto: "#146C3B" },
  UTILIZADA: { fondo: "#E3E8F7", texto: "#2F4A8A" },
  CANCELADA: { fondo: "#FDE2E2", texto: "#A1262B" },
  REEMBOLSADA: { fondo: "#EFE3FA", texto: "#6B2F9A" },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, sans-serif",
    serif: "Georgia, serif",
    rounded: "system-ui, sans-serif",
    mono: "ui-monospace, monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radio = 14;

export const MaxContentWidth = 800;
