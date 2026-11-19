import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { listarMisEventos } from "@/api/eventos";
import type { Evento } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha } from "@/utils/formato";

export default function MisEventosScreen() {
  const theme = useTheme();
  const { datos, error, cargando, recargando, recargar } = useConsulta(listarMisEventos);
  // Primero los que vienen (del más cercano al más lejano) y al final los que ya pasaron
  const ahora = Date.now();
  const eventos = [...(datos ?? [])].sort((a, b) => {
    const aPaso = new Date(a.fecha).getTime() <= ahora;
    const bPaso = new Date(b.fecha).getTime() <= ahora;
    return aPaso === bPaso ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime() : aPaso ? 1 : -1;
  });

  return (
    <PantallaTab
      titulo="Mis eventos"
      subtitulo="Cómo van las ventas"
      accion={<Boton titulo="+ Crear" onPress={() => router.push("/crear-evento")} style={styles.crear} />}
    >
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={eventos}
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
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}
    >
      <View style={styles.encabezado}>
        <ThemedText type="etiqueta" themeColor="primario">
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
      <View style={[styles.barra, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.relleno,
            { backgroundColor: theme.primario, width: `${cupoTotal ? Math.max((vendidas / cupoTotal) * 100, 2) : 0}%` },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: Spacing.four - 4,
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
