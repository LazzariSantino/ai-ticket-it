import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import type { Compra } from "@/api/tipos";
import { EstadoBadge } from "@/components/estado-badge";
import { ThemedText } from "@/components/themed-text";
import { Troquel } from "@/components/troquel";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha, formatearPrecio, textoDiasParaEvento } from "@/utils/formato";

// Una compra se ve como una entrada con talón: a la izquierda el evento, y en el talón cuántas entradas son.
// `vista` decide qué se destaca: el comprador ve el evento, el organizador ve quién compró.
export function CompraCard({ compra, vista = "comprador" }: { compra: Compra; vista?: "comprador" | "organizador" }) {
  const theme = useTheme();
  const comprador = vista === "comprador";

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(`/compra/${compra.id}`)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: theme.backgroundElement, borderColor: theme.borde, boxShadow: theme.sombra },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      {comprador && (
        <Image
          source={compra.evento.multimedia[0]}
          style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.cuerpo}>
        <EstadoBadge estado={compra.estado} />
        <ThemedText type="subtitle" style={styles.titulo} numberOfLines={2}>
          {comprador ? compra.evento.nombre : `${compra.comprador.nombre} ${compra.comprador.apellido}`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {comprador ? formatearFecha(compra.evento.fecha) : compra.tipoEntrada.nombre}
        </ThemedText>
        {compra.diasParaEvento !== null && (
          <View style={[styles.faltan, { backgroundColor: theme.acentoSuave }]}>
            <ThemedText type="smallBold" themeColor="acento">
              {textoDiasParaEvento(compra.diasParaEvento)}
            </ThemedText>
          </View>
        )}
      </View>

      <Troquel vertical />

      <View style={styles.talon}>
        <ThemedText type="title" style={styles.cantidad}>
          {compra.cantidad}
        </ThemedText>
        <ThemedText type="etiqueta" themeColor="textSecondary">
          {compra.cantidad === 1 ? "entrada" : "entradas"}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="primario" style={styles.total}>
          {formatearPrecio(compra.total)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  imagen: {
    width: 72,
  },
  cuerpo: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    gap: Spacing.one,
  },
  titulo: {
    fontSize: 17,
    lineHeight: 21,
    marginTop: 2,
  },
  faltan: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: Spacing.one,
  },
  talon: {
    width: 76,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    paddingRight: Spacing.one,
  },
  cantidad: {
    fontSize: 30,
    lineHeight: 32,
  },
  total: {
    marginTop: Spacing.one,
    fontSize: 12,
  },
});
