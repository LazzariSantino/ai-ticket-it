import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Boton } from "@/components/boton";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Cargando() {
  const theme = useTheme();
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={theme.primario} />
    </View>
  );
}

export function ErrorPantalla({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <View style={styles.centro}>
      <ThemedText type="subtitle">Algo salió mal</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.texto}>
        {mensaje}
      </ThemedText>
      {onReintentar && <Boton titulo="Reintentar" variante="secundario" onPress={onReintentar} />}
    </View>
  );
}

export function Vacio({ titulo, detalle }: { titulo: string; detalle?: string }) {
  return (
    <View style={styles.centro}>
      <ThemedText type="subtitle" style={styles.texto}>
        {titulo}
      </ThemedText>
      {detalle && (
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          {detalle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  texto: {
    textAlign: "center",
  },
});
