import { StyleSheet, View } from "react-native";

import type { Resenia } from "@/api/tipos";
import { Estrellas } from "@/components/estrellas";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export function ReseniaItem({ resenia }: { resenia: Resenia }) {
  return (
    <View style={styles.resenia}>
      <View style={styles.encabezado}>
        <ThemedText type="smallBold">
          {resenia.comprador.nombre} {resenia.comprador.apellido[0]}.
        </ThemedText>
        <Estrellas puntaje={resenia.puntuacion} tamanio={14} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        En «{resenia.evento.nombre}»
      </ThemedText>
      <ThemedText type="small">{resenia.detalle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  resenia: {
    gap: Spacing.half,
    paddingVertical: Spacing.two,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
