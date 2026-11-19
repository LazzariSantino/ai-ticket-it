import { Platform, StyleSheet, Text, type TextProps } from "react-native";

import { Fonts, ThemeColor, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "subtitle" | "small" | "smallBold" | "link" | "code" | "etiqueta" | "numero";
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = "default", themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = type === "link" ? theme.primario : theme[themeColor ?? "text"];

  return <Text style={[{ color }, styles[type], style]} {...rest} />;
}

// Con una fuente propia no se indica fontWeight: el peso ya viene en el nombre de la fuente
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  title: {
    fontFamily: Tipografias.titulo,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 600,
  },
  // Rótulo en mayúsculas y espaciado, para categorías y encabezados de sección
  etiqueta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  // Precios, cantidades y fechas destacadas
  numero: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
