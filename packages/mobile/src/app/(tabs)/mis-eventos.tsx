import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { listarMisEventos } from "@/api/eventos";
import type { Evento } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Marquesina, RadioGrande, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha } from "@/utils/formato";

export default function MisEventosScreen() {
  const theme = useTheme();
  const { datos, error, cargando, recargando, recargar } = useConsulta(listarMisEventos);

  return (
    <PantallaTab
      antetitulo="Panel del organizador"
      titulo="Mis eventos"
      accion={<Boton titulo="+ Crear" onPress={() => router.push("/crear-evento")} style={styles.crear} />}
    >
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={datos ?? []}
        keyExtractor={(evento) => String(evento.id)}
        renderItem={({ item }) => <EventoOrganizado evento={item} />}
        ListEmptyComponent={
          cargando ? (
            <Cargando />
          ) : error ? (
            <ErrorPantalla mensaje={error} onReintentar={recargar} />
          ) : (
            <Vacio titulo="Todavía no organizás eventos" detalle="Creá tu primer evento con el botón de arriba." />
          )
        }
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      />
    </PantallaTab>
  );
}

function EventoOrganizado({ evento }: { evento: Evento }) {
  const theme = useTheme();
  const vendidas = evento.tiposEntrada.reduce((total, tipo) => total + tipo.vendidas, 0);
  const cupoTotal = evento.tiposEntrada.reduce((total, tipo) => total + tipo.cupoTotal, 0);
  const finalizado = new Date(evento.fecha) <= new Date();

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(`/evento/${evento.id}/compras`)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: theme.backgroundElement, borderColor: theme.borde, boxShadow: theme.sombra },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.encabezado}>
        <ThemedText type="etiqueta" themeColor="acento">
          {formatearFecha(evento.fecha)}
        </ThemedText>
        {finalizado && (
          <ThemedText type="etiqueta" themeColor="textSecondary">
            Finalizado
          </ThemedText>
        )}
      </View>
      <ThemedText type="subtitle">{evento.nombre}</ThemedText>
      <View style={styles.encabezado}>
        <ThemedText type="small" themeColor="textSecondary">
          Vendidas {vendidas} de {cupoTotal} · Quedan {evento.entradasDisponibles}
        </ThemedText>
        <ThemedText type="numero" themeColor="primario">
          {cupoTotal ? Math.round((vendidas / cupoTotal) * 100) : 0}%
        </ThemedText>
      </View>
      <View style={[styles.barra, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.relleno,
            { backgroundImage: Marquesina, width: `${cupoTotal ? Math.max((vendidas / cupoTotal) * 100, 2) : 0}%` },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: Spacing.three + 4,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  crear: {
    minHeight: 38,
  },
  tarjeta: {
    padding: Spacing.three + 2,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: Spacing.one + 2,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barra: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: Spacing.one,
  },
  relleno: {
    height: "100%",
  },
});
