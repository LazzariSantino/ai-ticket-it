import { StyleSheet, View } from "react-native";

import type { Resenia } from "@/api/tipos";
import { Avatar } from "@/components/avatar";
import { Estrellas } from "@/components/estrellas";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export function ReseniaItem({ resenia }: { resenia: Resenia }) {
  const { nombre, apellido } = resenia.comprador;

  return (
    <View style={styles.resenia}>
      <View style={styles.encabezado}>
        <Avatar nombre={nombre} apellido={apellido} />
        <View style={styles.flex}>
          <ThemedText type="smallBold">
            {nombre} {apellido[0]}.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {resenia.evento.nombre}
          </ThemedText>
        </View>
        <Estrellas puntaje={resenia.puntuacion} tamanio={13} />
      </View>
      <ThemedText type="small" style={styles.texto}>
        {resenia.detalle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  resenia: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + 4,
  },
  flex: {
    flex: 1,
  },
  texto: {
    lineHeight: 21,
  },
});
