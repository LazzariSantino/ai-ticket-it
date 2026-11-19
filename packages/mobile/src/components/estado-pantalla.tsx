import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

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
      <Ilustracion emoji="🎭" />
      <ThemedText type="subtitle">Algo salió mal</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.texto}>
        {mensaje}
      </ThemedText>
      {onReintentar && <Boton titulo="Reintentar" variante="secundario" onPress={onReintentar} />}
    </View>
  );
}

export function Vacio({ titulo, detalle, emoji = "🎟️" }: { titulo: string; detalle?: string; emoji?: string }) {
  return (
    <View style={styles.centro}>
      <Ilustracion emoji={emoji} />
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

function Ilustracion({ emoji }: { emoji: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.ilustracion, { backgroundColor: theme.primarioSuave }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two + 4,
    padding: Spacing.four,
    minHeight: 280,
  },
  texto: {
    textAlign: "center",
    maxWidth: 320,
  },
  ilustracion: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  emoji: {
    fontSize: 38,
    lineHeight: 46,
  },
});
