import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import type { Compra } from "@/api/tipos";
import { EstadoBadge } from "@/components/estado-badge";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha, formatearPrecio, textoDiasParaEvento } from "@/utils/formato";

// `vista` decide qué se destaca: el comprador ve el evento, el organizador ve quién compró
export function CompraCard({ compra, vista = "comprador" }: { compra: Compra; vista?: "comprador" | "organizador" }) {
  const theme = useTheme();

  return (
    <Link href={`/compra/${compra.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tarjeta,
          { backgroundColor: theme.backgroundElement, borderColor: theme.borde, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {vista === "comprador" && (
          <Image
            source={compra.evento.multimedia[0]}
            style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
            contentFit="cover"
          />
        )}
        <View style={styles.cuerpo}>
          <EstadoBadge estado={compra.estado} />
          <ThemedText type="smallBold" numberOfLines={1}>
            {vista === "comprador" ? compra.evento.nombre : `${compra.comprador.nombre} ${compra.comprador.apellido}`}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {compra.cantidad} × {compra.tipoEntrada.nombre} · {formatearPrecio(compra.total)}
          </ThemedText>
          {vista === "comprador" && (
            <ThemedText type="small" themeColor="textSecondary">
              {formatearFecha(compra.evento.fecha)}
            </ThemedText>
          )}
          {compra.diasParaEvento !== null && (
            <ThemedText type="smallBold" themeColor="exito">
              {textoDiasParaEvento(compra.diasParaEvento)}
            </ThemedText>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    borderRadius: Radio,
    borderWidth: 1,
    overflow: "hidden",
  },
  imagen: {
    width: 96,
    minHeight: 112,
  },
  cuerpo: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
