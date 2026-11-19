import { StyleSheet, Text, View } from "react-native";

import type { Resenia } from "@/api/tipos";
import { Estrellas } from "@/components/estrellas";
import { ThemedText } from "@/components/themed-text";
import { Marquesina, Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function ReseniaItem({ resenia }: { resenia: Resenia }) {
  const theme = useTheme();
  const { nombre, apellido } = resenia.comprador;

  return (
    <View style={[styles.resenia, { borderTopColor: theme.borde }]}>
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.iniciales}>
            {nombre[0]}
            {apellido[0]}
          </Text>
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold">
            {nombre} {apellido[0]}.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            Fue a {resenia.evento.nombre}
          </ThemedText>
        </View>
        <Estrellas puntaje={resenia.puntuacion} tamanio={14} />
      </View>
      <ThemedText type="small" style={styles.texto}>
        “{resenia.detalle}”
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  resenia: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + 2,
  },
  flex: {
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: Marquesina,
  },
  iniciales: {
    color: "#FFFFFF",
    fontFamily: Tipografias.subtitulo,
    fontSize: 14,
  },
  texto: {
    lineHeight: 21,
  },
});
