import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { listarComprasDeEvento } from "@/api/compras";
import { ESTADOS_COMPRA, type EstadoCompra } from "@/api/tipos";
import { Chip } from "@/components/chip";
import { CompraCard } from "@/components/compra-card";
import { textoEstado } from "@/components/estado-badge";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { formatearFecha, formatearPrecio } from "@/utils/formato";

// Para el organizador: cómo van las ventas de su evento
export default function ComprasDeEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [estado, setEstado] = useState<EstadoCompra | undefined>();
  const { datos, error, cargando, recargando, recargar } = useConsulta(() => listarComprasDeEvento(id), [id]);

  if (cargando) return <Cargando />;
  if (error || !datos) return <ErrorPantalla mensaje={error ?? "No se encontró el evento"} onReintentar={recargar} />;

  const compras = datos.compras.filter((compra) => !estado || compra.estado === estado);

  const resumen = (
    <View style={styles.resumen}>
      <View>
        <ThemedText type="subtitle">{datos.evento.nombre}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatearFecha(datos.evento.fecha)}
        </ThemedText>
      </View>

      <Tarjeta titulo="Entradas disponibles por tipo">
        {datos.tiposEntrada.map((tipo) => (
          <View key={tipo.id} style={styles.tipo}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{tipo.nombre}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatearPrecio(tipo.precio)} · Vendidas {tipo.vendidas} de {tipo.cupoTotal}
              </ThemedText>
            </View>
            <View style={styles.disponibles}>
              <ThemedText type="subtitle" themeColor={tipo.cupoDisponible === 0 ? "peligro" : "exito"}>
                {tipo.cupoDisponible}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {tipo.cupoDisponible === 0 ? "agotado" : "quedan"}
              </ThemedText>
            </View>
          </View>
        ))}
      </Tarjeta>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip texto={`Todas (${datos.compras.length})`} activo={!estado} onPress={() => setEstado(undefined)} />
        {ESTADOS_COMPRA.map((opcion) => (
          <Chip
            key={opcion}
            texto={`${textoEstado(opcion)} (${datos.cantidadPorEstado[opcion]})`}
            activo={estado === opcion}
            onPress={() => setEstado(estado === opcion ? undefined : opcion)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: "Compras del evento" }} />
      <FlatList
        data={compras}
        keyExtractor={(compra) => String(compra.id)}
        renderItem={({ item }) => <CompraCard compra={item} vista="organizador" />}
        ListHeaderComponent={resumen}
        ListEmptyComponent={<Vacio titulo="No hay compras" detalle="Todavía no hay compras en este estado." />}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  lista: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  resumen: {
    gap: Spacing.three,
  },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  disponibles: {
    alignItems: "center",
    minWidth: 56,
  },
  chips: {
    gap: Spacing.two,
  },
});
