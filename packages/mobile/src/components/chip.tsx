import { Pressable, StyleSheet, Text } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[
        styles.chip,
        activo
          ? { backgroundColor: theme.primario, borderColor: theme.primario }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.borde },
      ]}
    >
      <Text style={[styles.texto, { color: activo ? theme.sobrePrimario : theme.text }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  texto: {
    fontSize: 14,
    fontWeight: 600,
  },
});
