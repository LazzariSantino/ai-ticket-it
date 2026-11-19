import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { buscarEventos, listarCategorias } from "@/api/eventos";
import type { OrdenEventos } from "@/api/tipos";
import { CampoTexto } from "@/components/campo-texto";
import { Desplegable, type Opcion } from "@/components/desplegable";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { EventoCard } from "@/components/evento-card";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useDemorado } from "@/hooks/use-demorado";
import { useTheme } from "@/hooks/use-theme";
import { useUsuario } from "@/sesion/sesion-context";

type Orden = `${OrdenEventos}-${"asc" | "desc"}`;

// Cada opción ya trae el sentido, así no hace falta un botón aparte para invertir el orden
const ORDENES: Opcion<Orden>[] = [
  { valor: "fecha-asc", texto: "Más próximos" },
  { valor: "fecha-desc", texto: "Más lejanos" },
  { valor: "precio-asc", texto: "Menor precio" },
  { valor: "precio-desc", texto: "Mayor precio" },
  { valor: "puntaje-desc", texto: "Mejor puntuados" },
];
const ORDEN_POR_DEFECTO: Orden = "fecha-asc";

export default function ExplorarScreen() {
  const theme = useTheme();
  const usuario = useUsuario();
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [orden, setOrden] = useState<Orden>(ORDEN_POR_DEFECTO);
  const textoDemorado = useDemorado(texto.trim());
  const [criterio, direccion] = orden.split("-") as [OrdenEventos, "asc" | "desc"];

  const categorias = useConsulta(listarCategorias);
  const eventos = useConsulta(
    () => buscarEventos({ q: textoDemorado, categoriaId, orden: criterio, direccion }),
    [textoDemorado, categoriaId, criterio, direccion],
  );

  const opcionesCategoria: Opcion<number | undefined>[] = [
    { valor: undefined, texto: "Todas" },
    ...(categorias.datos ?? []).map((categoria) => ({ valor: categoria.id, texto: categoria.nombre })),
  ];
  const hayFiltros = texto.trim() !== "" || categoriaId !== undefined || orden !== ORDEN_POR_DEFECTO;
  const cantidad = eventos.datos?.length ?? 0;

  function limpiarFiltros() {
    setTexto("");
    setCategoriaId(undefined);
    setOrden(ORDEN_POR_DEFECTO);
  }

  const filtros = (
    <View style={styles.filtros}>
      <CampoTexto
        value={texto}
        onChangeText={setTexto}
        placeholder="Buscá recitales, obras, charlas…"
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        accessibilityLabel="Buscar eventos"
      />
      <View style={styles.fila}>
        <View style={styles.flex}>
          <Desplegable
            compacto
            etiqueta="Categoría"
            titulo="Filtrar por categoría"
            valor={categoriaId}
            opciones={opcionesCategoria}
            onCambiar={setCategoriaId}
          />
        </View>
        <View style={styles.flex}>
          <Desplegable compacto etiqueta="Ordenar por" valor={orden} opciones={ORDENES} onCambiar={setOrden} />
        </View>
      </View>
      {!eventos.cargando && !eventos.error && (
        <View style={styles.resumen}>
          <ThemedText type="small" themeColor="textSecondary">
            {cantidad === 1 ? "1 evento" : `${cantidad} eventos`}
          </ThemedText>
          {hayFiltros && (
            <Pressable onPress={limpiarFiltros} hitSlop={8} accessibilityRole="button">
              <ThemedText type="link">Limpiar filtros</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  return (
    <PantallaTab titulo={`Hola, ${usuario.nombre}`} subtitulo="¿Qué plan tenés en mente?">
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
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
            <Vacio emoji="🔍" titulo="No encontramos eventos" detalle="Probá con otra búsqueda o categoría." />
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
    paddingHorizontal: Spacing.four - 4,
    paddingBottom: Spacing.five,
    gap: Spacing.three - 4,
  },
  filtros: {
    gap: Spacing.three - 4,
    marginBottom: Spacing.one,
  },
  fila: {
    flexDirection: "row",
    gap: Spacing.two + 2,
  },
  flex: {
    flex: 1,
  },
  resumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.one,
  },
});
