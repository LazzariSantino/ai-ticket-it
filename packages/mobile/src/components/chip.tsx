import { Pressable, StyleSheet, Text } from "react-native";

import { Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: activo ? theme.primario : theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.texto, { color: activo ? theme.sobrePrimario : theme.text }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
    borderRadius: 999,
  },
  texto: {
    fontFamily: Tipografias.destacado,
    fontSize: 14,
  },
});
