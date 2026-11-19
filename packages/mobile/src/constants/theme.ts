import { Platform } from "react-native";

// Identidad visual "minimal suave": blanco y aire, un único acento azul petróleo, superficies planas
// muy redondeadas (sin sombras ni degradés) y una tipografía redondeada en toda la app
export const Colors = {
  light: {
    text: "#15232D",
    background: "#FFFFFF",
    backgroundElement: "#F2F5F7",
    backgroundSelected: "#E6ECEF",
    textSecondary: "#687986",
    borde: "#E3E9EC",
    primario: "#0E7C86",
    primarioSuave: "#E1F2F3",
    acento: "#C76A1F",
    acentoSuave: "#FCEFE2",
    sobrePrimario: "#FFFFFF",
    peligro: "#D64545",
    peligroSuave: "#FCEBEB",
    exito: "#1E8E5A",
    estrella: "#F2A93B",
    velo: "rgba(13, 25, 33, 0.4)",
  },
  dark: {
    text: "#E8F0F2",
    background: "#0F1518",
    backgroundElement: "#182227",
    backgroundSelected: "#223038",
    textSecondary: "#93A4AE",
    borde: "#25333B",
    primario: "#52BAC4",
    primarioSuave: "#14353A",
    acento: "#F0A35E",
    acentoSuave: "#3A2A1C",
    sobrePrimario: "#0F1518",
    peligro: "#FF7070",
    peligroSuave: "#3A1E1E",
    exito: "#4CC38A",
    estrella: "#F5B85C",
    velo: "rgba(0, 0, 0, 0.6)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Cada estado de una compra tiene su color, para distinguirlos de un vistazo
export const ColoresEstado = {
  PENDIENTE: { fondo: "#FFF3DC", texto: "#8A5A00" },
  CONFIRMADA: { fondo: "#DFF3EA", texto: "#17734A" },
  UTILIZADA: { fondo: "#E5EDF6", texto: "#2E5486" },
  CANCELADA: { fondo: "#FBE6E6", texto: "#A23232" },
  REEMBOLSADA: { fondo: "#EEE8F7", texto: "#5E3F8F" },
} as const;

// Nunito en toda la app: con una fuente propia el peso va en el nombre de la fuente y no en fontWeight
export const Tipografias = {
  titulo: "Nunito-ExtraBold",
  subtitulo: "Nunito-Bold",
  destacado: "Nunito-SemiBold",
  texto: "Nunito-Regular",
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
export const RadioGrande = 28;

export const MaxContentWidth = 800;
