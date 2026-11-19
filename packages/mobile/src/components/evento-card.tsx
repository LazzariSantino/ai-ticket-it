import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Evento } from "@/api/tipos";
import { ThemedText } from "@/components/themed-text";
import { Troquel } from "@/components/troquel";
import { RadioGrande, Spacing, Tipografias, VeloFoto } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearPrecio, formatearPuntaje, partesDeFecha } from "@/utils/formato";

// Cada evento se ve como una entrada: la foto con el calendario y el nombre arriba, el troquel, y el talón con el precio
export function EventoCard({ evento }: { evento: Evento }) {
  const theme = useTheme();
  const agotado = evento.entradasDisponibles === 0;
  const fecha = partesDeFecha(evento.fecha);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${evento.nombre}, ${fecha.diaSemana} ${fecha.dia} de ${fecha.mes}`}
      onPress={() => router.push(`/evento/${evento.id}`)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: theme.backgroundElement, borderColor: theme.borde, boxShadow: theme.sombra },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.foto}>
        <Image
          source={evento.multimedia[0]}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.primarioSuave }]}
          contentFit="cover"
          transition={250}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundImage: VeloFoto }]} />

        {/* Todo va abajo, sobre el velo: así la parte de arriba de la foto (logos, escenarios) queda a la vista */}
        <View style={styles.abajo}>
          <View style={styles.textos}>
            <View style={styles.categoria}>
              <Text style={styles.categoriaTexto}>{evento.categoria.nombre}</Text>
            </View>
            <Text style={styles.nombre} numberOfLines={2}>
              {evento.nombre}
            </Text>
            <Text style={styles.cuando}>
              {fecha.diaSemana} · {fecha.hora} h
            </Text>
          </View>
          <View style={[styles.calendario, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.mes, { color: theme.acento }]}>{fecha.mes}</Text>
            <Text style={[styles.dia, { color: theme.text }]}>{fecha.dia}</Text>
          </View>
        </View>
      </View>

      <Troquel />

      <View style={styles.talon}>
        <View style={styles.flex}>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            por {evento.organizador.nombre} {evento.organizador.apellido}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.acento }}>
            {formatearPuntaje(evento.organizador.puntaje, evento.organizador.cantidadResenias)}
          </ThemedText>
        </View>
        {agotado ? (
          <View style={[styles.agotado, { backgroundColor: theme.acentoSuave }]}>
            <ThemedText type="etiqueta" themeColor="peligro">
              Agotado
            </ThemedText>
          </View>
        ) : (
          <View style={styles.precio}>
            {evento.tiposEntrada.length > 1 && evento.precioMinimo > 0 && (
              <ThemedText type="etiqueta" themeColor="textSecondary">
                Desde
              </ThemedText>
            )}
            <ThemedText type="numero" themeColor="primario">
              {formatearPrecio(evento.precioMinimo)}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  foto: {
    aspectRatio: 4 / 3,
    justifyContent: "flex-end",
    padding: Spacing.three,
  },
  categoria: {
    alignSelf: "flex-start",
    marginBottom: Spacing.one,
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(16, 13, 24, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  categoriaTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  calendario: {
    width: 54,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: "center",
    boxShadow: "0px 6px 16px rgba(16, 13, 24, 0.25)",
  },
  mes: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dia: {
    fontFamily: Tipografias.titulo,
    fontSize: 24,
    lineHeight: 26,
  },
  abajo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.three,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    color: "#FFFFFF",
    fontFamily: Tipografias.titulo,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  cuando: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontWeight: 500,
  },
  talon: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  precio: {
    alignItems: "flex-end",
  },
  agotado: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
