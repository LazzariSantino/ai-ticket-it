import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { Marquesina, Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro";
  cargando?: boolean;
  deshabilitado?: boolean;
  style?: ViewStyle;
};

// El botón principal lleva la marquesina de la marca; el secundario es suave y el de peligro, sólo un borde
export function Boton({ titulo, onPress, variante = "primario", cargando, deshabilitado, style }: Props) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;

  const fondo = {
    primario: { backgroundColor: theme.primario, backgroundImage: Marquesina },
    secundario: { backgroundColor: theme.primarioSuave },
    peligro: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: theme.peligro },
  }[variante];
  const texto = { primario: theme.sobrePrimario, secundario: theme.primario, peligro: theme.peligro }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        fondo,
        variante === "primario" && !inactivo && styles.brillo,
        { opacity: inactivo ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
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
    borderRadius: Radio,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    borderCurve: "continuous",
  },
  brillo: {
    boxShadow: "0px 8px 20px rgba(91, 46, 255, 0.28)",
  },
  texto: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
});
