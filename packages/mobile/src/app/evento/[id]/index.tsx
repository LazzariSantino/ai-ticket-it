import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { comprar } from "@/api/compras";
import { agregarFavorito, obtenerEvento, quitarFavorito } from "@/api/eventos";
import type { TipoEntrada } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { Cargando, ErrorPantalla } from "@/components/estado-pantalla";
import { Estrellas } from "@/components/estrellas";
import { ReseniaItem } from "@/components/resenia-item";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useSesion } from "@/sesion/sesion-context";
import { formatearFecha, formatearPrecio } from "@/utils/formato";

// El mismo tope que valida el backend (MAXIMO_ENTRADAS_POR_COMPRA)
const MAXIMO_POR_COMPRA = 10;

export default function EventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { actualizarUsuario } = useSesion();
  const { datos: evento, setDatos, error, cargando, recargar } = useConsulta(() => obtenerEvento(id), [id]);

  const [tipoElegido, setTipoElegido] = useState<TipoEntrada | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);
  const [errorFavorito, setErrorFavorito] = useState<string | null>(null);

  if (cargando) return <Cargando />;
  if (error || !evento) return <ErrorPantalla mensaje={error ?? "No se encontró el evento"} onReintentar={recargar} />;

  const maximo = Math.min(tipoElegido?.cupoDisponible ?? 0, MAXIMO_POR_COMPRA);

  function elegirTipo(tipo: TipoEntrada) {
    setTipoElegido(tipo);
    setCantidad(1);
    setErrorCompra(null);
  }

  async function alternarFavorito() {
    if (!evento || guardandoFavorito) return;
    setGuardandoFavorito(true);
    setErrorFavorito(null);
    try {
      const usuario = evento.esFavorito ? await quitarFavorito(evento.id) : await agregarFavorito(evento.id);
      actualizarUsuario(usuario);
      setDatos({ ...evento, esFavorito: !evento.esFavorito });
    } catch (e) {
      setErrorFavorito(e instanceof Error ? e.message : "No se pudo actualizar el favorito");
    } finally {
      setGuardandoFavorito(false);
    }
  }

  async function confirmarCompra() {
    if (!evento || !tipoElegido) return;
    setComprando(true);
    setErrorCompra(null);
    try {
      const compra = await comprar(evento.id, tipoElegido.id, cantidad);
      router.replace(`/compra/${compra.id}`);
    } catch (e) {
      setErrorCompra(e instanceof Error ? e.message : "No se pudo realizar la compra");
      setComprando(false);
      recargar();
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen
        options={{
          title: evento.nombre,
          headerRight: () => (
            <Pressable onPress={alternarFavorito} hitSlop={10} accessibilityLabel="Favorito">
              <Text style={[styles.corazon, { color: theme.peligro }]}>{evento.esFavorito ? "♥" : "♡"}</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {evento.multimedia.map((url) => (
            <Image
              key={url}
              source={url}
              style={[styles.imagen, { width, backgroundColor: theme.primarioSuave }]}
              contentFit="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.cuerpo}>
          <ThemedText type="small" style={{ color: theme.primario }}>
            {evento.categoria.nombre.toUpperCase()} · {formatearFecha(evento.fecha)}
          </ThemedText>
          <ThemedText type="title">{evento.nombre}</ThemedText>
          {errorFavorito && (
            <ThemedText type="small" themeColor="peligro">
              {errorFavorito}
            </ThemedText>
          )}
          <ThemedText>{evento.descripcion}</ThemedText>

          <Tarjeta titulo="Organiza">
            <View style={styles.organizador}>
              <ThemedText>
                {evento.organizador.nombre} {evento.organizador.apellido}
              </ThemedText>
              {evento.organizador.puntaje === null ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Sin reseñas todavía
                </ThemedText>
              ) : (
                <View style={styles.puntaje}>
                  <Estrellas puntaje={evento.organizador.puntaje} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {evento.organizador.puntaje.toFixed(1)} ({evento.organizador.cantidadResenias})
                  </ThemedText>
                </View>
              )}
            </View>
          </Tarjeta>

          {evento.esOrganizador ? (
            <Tarjeta titulo="Es tu evento">
              <ThemedText type="small" themeColor="textSecondary">
                No podés comprar entradas de un evento que organizás, pero podés seguir sus ventas.
              </ThemedText>
              <Boton titulo="Ver compras del evento" onPress={() => router.push(`/evento/${evento.id}/compras`)} />
            </Tarjeta>
          ) : (
            <Tarjeta titulo="Elegí tu entrada">
              {evento.tiposEntrada.map((tipo) => {
                const agotado = tipo.cupoDisponible === 0;
                const elegido = tipoElegido?.id === tipo.id;
                return (
                  <Pressable
                    key={tipo.id}
                    disabled={agotado}
                    onPress={() => elegirTipo(tipo)}
                    style={[
                      styles.tipo,
                      { borderColor: elegido ? theme.primario : theme.borde, opacity: agotado ? 0.5 : 1 },
                      elegido && { backgroundColor: theme.primarioSuave },
                    ]}
                  >
                    <View style={styles.flex}>
                      <ThemedText type="smallBold">{tipo.nombre}</ThemedText>
                      {tipo.descripcion ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          {tipo.descripcion}
                        </ThemedText>
                      ) : null}
                      <ThemedText type="small" themeColor={agotado ? "peligro" : "textSecondary"}>
                        {agotado ? "Agotado" : `Quedan ${tipo.cupoDisponible}`}
                      </ThemedText>
                    </View>
                    <ThemedText type="subtitle">{formatearPrecio(tipo.precio)}</ThemedText>
                  </Pressable>
                );
              })}

              {tipoElegido && (
                <>
                  <View style={styles.cantidad}>
                    <ThemedText>Cantidad</ThemedText>
                    <View style={styles.selector}>
                      <Boton
                        titulo="−"
                        variante="secundario"
                        style={styles.botonCantidad}
                        deshabilitado={cantidad <= 1}
                        onPress={() => setCantidad(cantidad - 1)}
                      />
                      <ThemedText type="subtitle">{cantidad}</ThemedText>
                      <Boton
                        titulo="+"
                        variante="secundario"
                        style={styles.botonCantidad}
                        deshabilitado={cantidad >= maximo}
                        onPress={() => setCantidad(cantidad + 1)}
                      />
                    </View>
                  </View>
                  <View style={styles.cantidad}>
                    <ThemedText type="smallBold">Total</ThemedText>
                    <ThemedText type="subtitle">{formatearPrecio(tipoElegido.precio * cantidad)}</ThemedText>
                  </View>
                </>
              )}

              {errorCompra && (
                <ThemedText type="small" themeColor="peligro">
                  {errorCompra}
                </ThemedText>
              )}
              <Boton
                titulo={tipoElegido ? "Comprar" : "Elegí un tipo de entrada"}
                onPress={confirmarCompra}
                cargando={comprando}
                deshabilitado={!tipoElegido}
              />
            </Tarjeta>
          )}

          <Tarjeta titulo={`Reseñas de eventos de ${evento.organizador.nombre}`}>
            {evento.reseniasDelOrganizador.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Todavía nadie reseñó sus eventos.
              </ThemedText>
            ) : (
              evento.reseniasDelOrganizador.map((resenia) => <ReseniaItem key={resenia.id} resenia={resenia} />)
            )}
          </Tarjeta>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    paddingBottom: Spacing.six,
  },
  imagen: {
    aspectRatio: 16 / 9,
  },
  cuerpo: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  corazon: {
    fontSize: 26,
  },
  organizador: {
    gap: Spacing.one,
  },
  puntaje: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radio,
    borderWidth: 1,
  },
  cantidad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  botonCantidad: {
    minHeight: 40,
    width: 44,
  },
});
