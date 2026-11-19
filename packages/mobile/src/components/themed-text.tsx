import { StyleSheet, Text, type TextProps } from "react-native";

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

const styles = StyleSheet.create({
  default: {
    fontFamily: Tipografias.texto,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Tipografias.titulo,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 20,
    lineHeight: 26,
  },
  small: {
    fontFamily: Tipografias.texto,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 15,
    lineHeight: 22,
  },
  // Rótulo chico de sección o de dato ("Entrada", "Total", "Reseñas")
  etiqueta: {
    fontFamily: Tipografias.destacado,
    fontSize: 13,
    lineHeight: 18,
  },
  // Precios, cantidades y fechas destacadas
  numero: {
    fontFamily: Tipografias.titulo,
    fontSize: 18,
    lineHeight: 23,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
