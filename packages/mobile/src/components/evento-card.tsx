import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { urlImagen } from "@/api/cliente";
import type { Evento } from "@/api/tipos";
import { BotonIcono } from "@/components/boton-icono";
import { ThemedText } from "@/components/themed-text";
import { Radio, RadioGrande, Spacing } from "@/constants/theme";
import { useFavorito } from "@/hooks/use-favorito";
import { useTheme } from "@/hooks/use-theme";
import { compartirEvento } from "@/utils/compartir";
import { formatearPrecio, partesDeFecha } from "@/utils/formato";

// Fila plana: la foto redondeada a la izquierda y los datos al lado, sin nada encima de la imagen
export function EventoCard({ evento }: { evento: Evento }) {
  const theme = useTheme();
  const agotado = evento.entradasDisponibles === 0;
  const fecha = partesDeFecha(evento.fecha);
  const { puntaje, cantidadResenias } = evento.organizador;
  const favorito = useFavorito(evento.id);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${evento.nombre}, ${fecha.diaSemana} ${fecha.dia} de ${fecha.mes}, ${formatearPrecio(evento.precioMinimo)}`}
      onPress={() => router.push(`/evento/${evento.id}`)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}
    >
      <Image
        source={urlImagen(evento.multimedia[0])}
        style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
        contentFit="cover"
        contentPosition="top"
        transition={200}
      />
      <View style={styles.cuerpo}>
        <View style={styles.arriba}>
          <ThemedText type="etiqueta" themeColor="primario" style={styles.categoria} numberOfLines={1}>
            {evento.categoria.nombre}
          </ThemedText>
          {/* Se puede guardar o compartir sin entrar al evento */}
          <BotonIcono
            icono="share-outline"
            etiqueta={`Compartir ${evento.nombre}`}
            onPress={() => compartirEvento(evento)}
            tamanio={30}
          />
          <BotonIcono
            icono={favorito.esFavorito ? "heart" : "heart-outline"}
            etiqueta={
              favorito.esFavorito ? `Quitar ${evento.nombre} de favoritos` : `Guardar ${evento.nombre} en favoritos`
            }
            activo={favorito.esFavorito}
            color={favorito.esFavorito ? theme.peligro : undefined}
            onPress={favorito.alternar}
            tamanio={30}
          />
        </View>
        <ThemedText type="smallBold" style={styles.nombre} numberOfLines={2}>
          {evento.nombre}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {fecha.diaSemanaCorto} {fecha.dia} {fecha.mes} · {fecha.hora} h
        </ThemedText>
        <View style={styles.pie}>
          <ThemedText type="small" themeColor="textSecondary">
            {puntaje === null ? "Sin reseñas" : `★ ${puntaje.toFixed(1)} (${cantidadResenias})`}
          </ThemedText>
          {agotado ? (
            <ThemedText type="smallBold" themeColor="peligro">
              Agotado
            </ThemedText>
          ) : (
            <ThemedText type="smallBold" themeColor="primario">
              {evento.tiposEntrada.length > 1 && evento.precioMinimo > 0 ? "desde " : ""}
              {formatearPrecio(evento.precioMinimo)}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    gap: Spacing.three - 2,
    padding: Spacing.two + 2,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  imagen: {
    width: 104,
    height: 116,
    borderRadius: Radio + 2,
    borderCurve: "continuous",
  },
  cuerpo: {
    flex: 1,
    gap: 2,
    paddingVertical: Spacing.one,
    paddingRight: Spacing.one,
  },
  nombre: {
    fontSize: 16,
    lineHeight: 21,
  },
  arriba: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + 2,
    marginTop: -2,
  },
  categoria: {
    flex: 1,
  },
  pie: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
});
