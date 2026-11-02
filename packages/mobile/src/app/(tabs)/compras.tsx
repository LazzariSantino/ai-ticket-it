import { useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";

import { listarMisCompras } from "@/api/compras";
import { ESTADOS_COMPRA, type EstadoCompra } from "@/api/tipos";
import { Chip } from "@/components/chip";
import { CompraCard } from "@/components/compra-card";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { textoEstado } from "@/components/estado-badge";
import { PantallaTab } from "@/components/pantalla-tab";
import { Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";

export default function MisComprasScreen() {
  const theme = useTheme();
  const [estado, setEstado] = useState<EstadoCompra | undefined>();
  const { datos, error, cargando, recargando, recargar } = useConsulta(listarMisCompras);

  const compras = (datos ?? []).filter((compra) => !estado || compra.estado === estado);
  const cantidad = (filtro: EstadoCompra) => (datos ?? []).filter((compra) => compra.estado === filtro).length;

  return (
    <PantallaTab titulo="Mis compras">
      <FlatList
        data={compras}
        keyExtractor={(compra) => String(compra.id)}
        renderItem={({ item }) => <CompraCard compra={item} />}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip texto="Todas" activo={!estado} onPress={() => setEstado(undefined)} />
            {ESTADOS_COMPRA.map((opcion) => (
              <Chip
                key={opcion}
                texto={`${textoEstado(opcion)} (${cantidad(opcion)})`}
                activo={estado === opcion}
                onPress={() => setEstado(estado === opcion ? undefined : opcion)}
              />
            ))}
          </ScrollView>
        }
        ListEmptyComponent={
          cargando ? (
            <Cargando />
          ) : error ? (
            <ErrorPantalla mensaje={error} onReintentar={recargar} />
          ) : (
            <Vacio titulo="No hay compras" detalle="Cuando compres entradas las vas a ver acá." />
          )
        }
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      />
    </PantallaTab>
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  chips: {
    gap: Spacing.two,
  },
});
