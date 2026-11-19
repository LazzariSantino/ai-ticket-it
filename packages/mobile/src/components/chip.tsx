import { Pressable, StyleSheet, Text } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// El chip elegido se pinta con la tinta del tema: se distingue sin competir con el botón principal
export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        activo
          ? { backgroundColor: theme.tinta, borderColor: theme.tinta }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.borde },
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.texto, { color: activo ? theme.sobreTinta : theme.text }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  texto: {
    fontSize: 14,
    fontWeight: 600,
  },
});
