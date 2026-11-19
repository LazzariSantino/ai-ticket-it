import { createContext, useContext, type ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Avisa a los campos que están sobre una tarjeta gris, para que se pinten del color del fondo y se distingan
const SobreTarjeta = createContext(false);

// El color de fondo que tiene que usar un campo según dónde esté
export function useFondoDeCampo() {
  const theme = useTheme();
  return useContext(SobreTarjeta) ? theme.background : theme.backgroundElement;
}

// Superficie plana con fondo suave: agrupa contenido sin bordes ni sombras
export function Tarjeta({ titulo, children, style }: { titulo?: string; children: ReactNode; style?: ViewStyle }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.tarjeta, style]}>
      {titulo && (
        <ThemedText type="subtitle" style={styles.titulo}>
          {titulo}
        </ThemedText>
      )}
      <SobreTarjeta.Provider value={true}>{children}</SobreTarjeta.Provider>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: Spacing.four - 4,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    gap: Spacing.three - 4,
  },
  titulo: {
    fontSize: 17,
    lineHeight: 22,
  },
});
