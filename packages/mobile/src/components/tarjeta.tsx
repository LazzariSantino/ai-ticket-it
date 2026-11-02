import type { ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Tarjeta({ titulo, children, style }: { titulo?: string; children: ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={[styles.tarjeta, { borderColor: theme.borde }, style]}>
      {titulo && <ThemedText type="smallBold">{titulo}</ThemedText>}
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: Spacing.three,
    borderRadius: Radio,
    borderWidth: 1,
    gap: Spacing.two,
  },
});
