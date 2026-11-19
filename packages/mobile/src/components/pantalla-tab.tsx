import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

// Contenedor de las pantallas de las pestañas: las pestañas nativas no tienen header, así que lleva su título.
// `antetitulo` es la línea chica de color que va arriba (un saludo o el contexto de la pantalla).
export function PantallaTab({
  titulo,
  antetitulo,
  accion,
  children,
}: {
  titulo: string;
  antetitulo?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top", "left", "right"]}>
        <View style={styles.encabezado}>
          <View style={styles.textos}>
            {antetitulo && (
              <ThemedText type="etiqueta" themeColor="acento">
                {antetitulo}
              </ThemedText>
            )}
            <ThemedText type="title">{titulo}</ThemedText>
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three + 4,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  textos: {
    flex: 1,
    gap: Spacing.one,
  },
});
