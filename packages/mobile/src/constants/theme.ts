import { Platform } from "react-native";

// Identidad visual "noche de función": papel cálido y tinta de día, escenario oscuro de noche,
// y una marquesina violeta → coral para lo que importa (comprar, el estado activo, los acentos)
export const Colors = {
  light: {
    text: "#1A1523",
    background: "#F7F3EE",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#EFE9E1",
    textSecondary: "#6E6779",
    borde: "#E9E2D8",
    primario: "#5B2EFF",
    primarioSuave: "#EEE8FF",
    acento: "#FF4D6D",
    acentoSuave: "#FFE6EA",
    sobrePrimario: "#FFFFFF",
    tinta: "#1A1523",
    sobreTinta: "#FFFFFF",
    peligro: "#E5484D",
    exito: "#12A150",
    // Sombra cálida para las tarjetas (en modo oscuro alcanza con el borde)
    sombra: "0px 10px 30px rgba(26, 21, 35, 0.08)",
  },
  dark: {
    text: "#F4F1FA",
    background: "#100D18",
    backgroundElement: "#1B1726",
    backgroundSelected: "#272136",
    textSecondary: "#A9A2B8",
    borde: "#2C2639",
    primario: "#9277FF",
    primarioSuave: "#2A2147",
    acento: "#FF6B85",
    acentoSuave: "#3A1D29",
    sobrePrimario: "#FFFFFF",
    tinta: "#F4F1FA",
    sobreTinta: "#100D18",
    peligro: "#FF6369",
    exito: "#3DD68C",
    sombra: "0px 0px 0px rgba(0, 0, 0, 0)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// El degradé de la marca, en sintaxis CSS (React Native lo dibuja nativo con backgroundImage)
export const Marquesina = "linear-gradient(120deg, #5B2EFF 0%, #B23CFF 55%, #FF4D6D 100%)";
// Oscurece la parte de abajo de una foto para que el texto blanco encima se lea bien
export const VeloFoto = "linear-gradient(180deg, rgba(16,13,24,0) 35%, rgba(16,13,24,0.85) 100%)";

// Cada estado de una compra tiene su color, para distinguirlos de un vistazo
export const ColoresEstado = {
  PENDIENTE: { fondo: "#FFF1D6", texto: "#8A5300", punto: "#F5A524" },
  CONFIRMADA: { fondo: "#DCF7E7", texto: "#0E6B37", punto: "#12A150" },
  UTILIZADA: { fondo: "#E4E8F8", texto: "#2F4589", punto: "#4F6BD8" },
  CANCELADA: { fondo: "#FDE3E4", texto: "#A1262B", punto: "#E5484D" },
  REEMBOLSADA: { fondo: "#F0E5FB", texto: "#6B2F9A", punto: "#9B51E0" },
} as const;

// Bricolage Grotesque para títulos y números; el resto usa la fuente del sistema, que se lee mejor en tamaños chicos
export const Tipografias = {
  titulo: "Bricolage-ExtraBold",
  subtitulo: "Bricolage-Bold",
  destacado: "Bricolage-SemiBold",
};

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

export const Radio = 18;
export const RadioGrande = 24;

export const MaxContentWidth = 800;
