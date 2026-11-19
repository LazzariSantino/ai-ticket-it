import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
  deshabilitado?: boolean;
  style?: ViewStyle;
};

// Botones en forma de píldora: el principal lleno de color, el secundario y el de peligro con un fondo suave
export function Boton({ titulo, onPress, variante = "primario", cargando, deshabilitado, style }: Props) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;

  const fondo = { primario: theme.primario, secundario: theme.primarioSuave, peligro: theme.peligroSuave }[variante];
  const texto = { primario: theme.sobrePrimario, secundario: theme.primario, peligro: theme.peligro }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo, opacity: inactivo ? 0.45 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      {cargando ? <ActivityIndicator color={texto} /> : <Text style={[styles.texto, { color: texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  texto: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 16,
    textAlign: "center",
  },
});
