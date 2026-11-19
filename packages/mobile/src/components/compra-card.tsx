import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { urlImagen } from "@/api/cliente";
import type { Compra } from "@/api/tipos";
import { EstadoBadge } from "@/components/estado-badge";
import { ThemedText } from "@/components/themed-text";
import { Radio, RadioGrande, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearPrecio, partesDeFecha, textoDiasParaEvento } from "@/utils/formato";

// `vista` decide qué se destaca: el comprador ve el evento, el organizador ve quién compró
export function CompraCard({ compra, vista = "comprador" }: { compra: Compra; vista?: "comprador" | "organizador" }) {
  const theme = useTheme();
  const comprador = vista === "comprador";
  const fecha = partesDeFecha(compra.evento.fecha);

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(`/compra/${compra.id}`)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}
    >
      {comprador && (
        <Image
          source={urlImagen(compra.evento.multimedia[0])}
          style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.cuerpo}>
        <EstadoBadge estado={compra.estado} />
        <ThemedText type="smallBold" style={styles.titulo} numberOfLines={2}>
          {comprador ? compra.evento.nombre : `${compra.comprador.nombre} ${compra.comprador.apellido}`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {compra.cantidad} × {compra.tipoEntrada.nombre} · {formatearPrecio(compra.total)}
        </ThemedText>
        {comprador && (
          <ThemedText type="small" themeColor="textSecondary">
            {fecha.diaSemanaCorto} {fecha.dia} {fecha.mes} · {fecha.hora} h
          </ThemedText>
        )}
        {compra.diasParaEvento !== null && (
          <ThemedText type="smallBold" themeColor="acento">
            {textoDiasParaEvento(compra.diasParaEvento)}
          </ThemedText>
        )}
      </View>
      <ThemedText type="subtitle" themeColor="textSecondary" style={styles.flecha}>
        ›
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - 2,
    padding: Spacing.two + 2,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  imagen: {
    width: 84,
    height: 96,
    borderRadius: Radio,
    borderCurve: "continuous",
  },
  cuerpo: {
    flex: 1,
    gap: 3,
    paddingVertical: Spacing.one,
  },
  titulo: {
    fontSize: 16,
    lineHeight: 21,
  },
  flecha: {
    paddingHorizontal: Spacing.one,
  },
});
