import { useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { buscarEventos, listarCategorias } from "@/api/eventos";
import type { OrdenEventos } from "@/api/tipos";
import { CampoTexto } from "@/components/campo-texto";
import { Chip } from "@/components/chip";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { EventoCard } from "@/components/evento-card";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useDemorado } from "@/hooks/use-demorado";
import { useTheme } from "@/hooks/use-theme";

const ORDENES: { valor: OrdenEventos; texto: string; direccionPorDefecto: "asc" | "desc" }[] = [
  { valor: "fecha", texto: "Fecha", direccionPorDefecto: "asc" },
  { valor: "precio", texto: "Precio", direccionPorDefecto: "asc" },
  { valor: "puntaje", texto: "Puntaje", direccionPorDefecto: "desc" },
];

export default function ExplorarScreen() {
  const theme = useTheme();
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [orden, setOrden] = useState<OrdenEventos>("fecha");
  const [direccion, setDireccion] = useState<"asc" | "desc">("asc");
  const textoDemorado = useDemorado(texto.trim());

  const categorias = useConsulta(listarCategorias);
  const eventos = useConsulta(
    () => buscarEventos({ q: textoDemorado, categoriaId, orden, direccion }),
    [textoDemorado, categoriaId, orden, direccion],
  );

  function elegirOrden(nuevo: (typeof ORDENES)[number]) {
    setOrden(nuevo.valor);
    setDireccion(nuevo.direccionPorDefecto);
  }

  const filtros = (
    <View style={styles.filtros}>
      <CampoTexto
        value={texto}
        onChangeText={setTexto}
        placeholder="Buscar recitales, obras, artistas..."
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
        <Chip texto="Todas" activo={categoriaId === undefined} onPress={() => setCategoriaId(undefined)} />
        {categorias.datos?.map((categoria) => (
          <Chip
            key={categoria.id}
            texto={categoria.nombre}
            activo={categoriaId === categoria.id}
            onPress={() => setCategoriaId(categoriaId === categoria.id ? undefined : categoria.id)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.etiqueta}>
          Ordenar por
        </ThemedText>
        {ORDENES.map((opcion) => (
          <Chip
            key={opcion.valor}
            texto={opcion.texto}
            activo={orden === opcion.valor}
            onPress={() => elegirOrden(opcion)}
          />
        ))}
        <Chip
          texto={direccion === "asc" ? "↑ Ascendente" : "↓ Descendente"}
          activo={false}
          onPress={() => setDireccion(direccion === "asc" ? "desc" : "asc")}
        />
      </ScrollView>
    </View>
  );

  return (
    <PantallaTab titulo="Explorar">
      <FlatList
        data={eventos.datos ?? []}
        keyExtractor={(evento) => String(evento.id)}
        renderItem={({ item }) => <EventoCard evento={item} />}
        ListHeaderComponent={filtros}
        ListEmptyComponent={
          eventos.cargando ? (
            <Cargando />
          ) : eventos.error ? (
            <ErrorPantalla mensaje={eventos.error} onReintentar={eventos.recargar} />
          ) : (
            <Vacio titulo="No encontramos eventos" detalle="Probá con otra búsqueda o categoría." />
          )
        }
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={eventos.recargando} onRefresh={eventos.recargar} tintColor={theme.primario} />
        }
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
  filtros: {
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  fila: {
    gap: Spacing.two,
    alignItems: "center",
  },
  etiqueta: {
    marginRight: Spacing.one,
  },
});
