import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import type { Evento } from "@/api/tipos";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha, formatearPrecio, formatearPuntaje } from "@/utils/formato";

export function EventoCard({ evento }: { evento: Evento }) {
  const theme = useTheme();
  const agotado = evento.entradasDisponibles === 0;

  return (
    <Link href={`/evento/${evento.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tarjeta,
          { backgroundColor: theme.backgroundElement, borderColor: theme.borde, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Image
          source={evento.multimedia[0]}
          style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cuerpo}>
          <ThemedText type="small" style={{ color: theme.primario }}>
            {evento.categoria.nombre.toUpperCase()} · {formatearFecha(evento.fecha)}
          </ThemedText>
          <ThemedText type="subtitle" numberOfLines={2}>
            {evento.nombre}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {evento.organizador.nombre} {evento.organizador.apellido} ·{" "}
            {formatearPuntaje(evento.organizador.puntaje, evento.organizador.cantidadResenias)}
          </ThemedText>
          <View style={styles.pie}>
            <ThemedText type="smallBold">
              {evento.tiposEntrada.length > 1 ? "Desde " : ""}
              {formatearPrecio(evento.precioMinimo)}
            </ThemedText>
            {agotado && (
              <ThemedText type="smallBold" themeColor="peligro">
                AGOTADO
              </ThemedText>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: Radio,
    borderWidth: 1,
    overflow: "hidden",
  },
  imagen: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  cuerpo: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  pie: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.one,
  },
});
