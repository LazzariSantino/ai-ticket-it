import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

// Contenedor de las pantallas de las pestañas: las pestañas nativas no tienen header, así que lleva su título
// y, debajo, una línea en gris que explica qué hay en la pantalla
export function PantallaTab({
  titulo,
  subtitulo,
  accion,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top", "left", "right"]}>
        <View style={styles.encabezado}>
          <View style={styles.textos}>
            <ThemedText type="title">{titulo}</ThemedText>
            {subtitulo && <ThemedText themeColor="textSecondary">{subtitulo}</ThemedText>}
          </View>
          {accion}
        </View>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four - 4,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
});
