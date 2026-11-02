import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
  deshabilitado?: boolean;
  style?: ViewStyle;
};

export function Boton({ titulo, onPress, variante = "primario", cargando, deshabilitado, style }: Props) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;

  const fondo = { primario: theme.primario, secundario: theme.primarioSuave, peligro: "transparent" }[variante];
  const texto = { primario: theme.sobrePrimario, secundario: theme.primario, peligro: theme.peligro }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo, opacity: inactivo ? 0.5 : pressed ? 0.8 : 1 },
        variante === "peligro" && { borderWidth: 1, borderColor: theme.peligro },
        style,
      ]}
    >
      {cargando ? <ActivityIndicator color={texto} /> : <Text style={[styles.texto, { color: texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    borderRadius: Radio,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  texto: {
    fontSize: 16,
    fontWeight: 600,
  },
});
