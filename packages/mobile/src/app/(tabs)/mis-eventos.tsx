import { Link, router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { listarMisEventos } from "@/api/eventos";
import type { Evento } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha } from "@/utils/formato";

export default function MisEventosScreen() {
  const theme = useTheme();
  const { datos, error, cargando, recargando, recargar } = useConsulta(listarMisEventos);

  return (
    <PantallaTab
      titulo="Mis eventos"
      accion={<Boton titulo="+ Crear" onPress={() => router.push("/crear-evento")} style={styles.crear} />}
    >
      <FlatList
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
    <Link href={`/evento/${evento.id}/compras`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.tarjeta,
          { backgroundColor: theme.backgroundElement, borderColor: theme.borde, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={styles.encabezado}>
          <ThemedText type="small" style={{ color: theme.primario }}>
            {formatearFecha(evento.fecha)}
          </ThemedText>
          {finalizado && (
            <ThemedText type="smallBold" themeColor="textSecondary">
              FINALIZADO
            </ThemedText>
          )}
        </View>
        <ThemedText type="subtitle">{evento.nombre}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Vendidas {vendidas} de {cupoTotal} · Quedan {evento.entradasDisponibles}
        </ThemedText>
        <View style={[styles.barra, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.relleno,
              { backgroundColor: theme.primario, width: `${cupoTotal ? (vendidas / cupoTotal) * 100 : 0}%` },
            ]}
          />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  crear: {
    minHeight: 38,
  },
  tarjeta: {
    padding: Spacing.three,
    borderRadius: Radio,
    borderWidth: 1,
    gap: Spacing.one,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barra: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: Spacing.one,
  },
  relleno: {
    height: "100%",
  },
});
