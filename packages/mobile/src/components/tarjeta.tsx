import type { ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Tarjeta({ titulo, children, style }: { titulo?: string; children: ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.tarjeta, { borderColor: theme.borde, boxShadow: theme.sombra }, style]}
    >
      {titulo && (
        <ThemedText type="etiqueta" themeColor="textSecondary">
          {titulo}
        </ThemedText>
      )}
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: Spacing.three + 2,
    borderRadius: RadioGrande,
    borderWidth: 1,
    borderCurve: "continuous",
    gap: Spacing.two + 4,
  },
});
