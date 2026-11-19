import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
import { Radio, Spacing, Tipografias, VeloFoto } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useSesion } from "@/sesion/sesion-context";
import { formatearPrecio, partesDeFecha } from "@/utils/formato";

// El mismo tope que valida el backend (MAXIMO_ENTRADAS_POR_COMPRA)
const MAXIMO_POR_COMPRA = 10;

export default function EventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { actualizarUsuario } = useSesion();
  const { datos: evento, setDatos, error, cargando, recargar } = useConsulta(() => obtenerEvento(id), [id]);

  // Se guarda el id y no el tipo: así, si se recarga el evento (por ejemplo, después de una compra fallida),
  // el cupo disponible que se usa es el actualizado y no una copia vieja
  const [tipoElegidoId, setTipoElegidoId] = useState<number | null>(null);
  const [cantidadElegida, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);
  const [errorFavorito, setErrorFavorito] = useState<string | null>(null);
  const [foto, setFoto] = useState(0);

  if (cargando) return <Cargando />;
  if (error || !evento) return <ErrorPantalla mensaje={error ?? "No se encontró el evento"} onReintentar={recargar} />;

  // Si el tipo elegido se agotó mientras tanto, deja de estar elegido
  const tipoElegido = evento.tiposEntrada.find((tipo) => tipo.id === tipoElegidoId && tipo.cupoDisponible > 0) ?? null;
  const maximo = Math.min(tipoElegido?.cupoDisponible ?? 0, MAXIMO_POR_COMPRA);
  const cantidad = Math.max(1, Math.min(cantidadElegida, maximo));
  const fecha = partesDeFecha(evento.fecha);

  function elegirTipo(tipo: TipoEntrada) {
    setTipoElegidoId(tipo.id);
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
          title: "",
          headerTransparent: true,
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <Pressable
              onPress={alternarFavorito}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={evento.esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
              style={styles.favorito}
            >
              <Text style={[styles.corazon, { color: evento.esFavorito ? theme.acento : "#FFFFFF" }]}>
                {evento.esFavorito ? "♥" : "♡"}
              </Text>
            </Pressable>
          ),
        }}
      />
      {/* La foto queda detrás de la barra de estado, así que el texto de la barra va en blanco */}
      <StatusBar style="light" />
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={styles.contenido}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setFoto(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {evento.multimedia.map((url) => (
              <Image
                key={url}
                source={url}
                style={[styles.imagen, { width, backgroundColor: theme.primarioSuave }]}
                contentFit="cover"
                transition={250}
              />
            ))}
          </ScrollView>
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.velo]}>
            <View style={styles.categoria}>
              <Text style={styles.categoriaTexto}>{evento.categoria.nombre}</Text>
            </View>
            <Text style={styles.nombre}>{evento.nombre}</Text>
            {evento.multimedia.length > 1 && (
              <View style={styles.puntos}>
                {evento.multimedia.map((url, indice) => (
                  <View key={url} style={[styles.punto, indice === foto && styles.puntoActivo]} />
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.cuerpo}>
          <View
            style={[
              styles.datos,
              { backgroundColor: theme.backgroundElement, borderColor: theme.borde, boxShadow: theme.sombra },
            ]}
          >
            <View style={[styles.calendario, { backgroundColor: theme.acentoSuave }]}>
              <Text style={[styles.mes, { color: theme.acento }]}>{fecha.mes}</Text>
              <Text style={[styles.dia, { color: theme.acento }]}>{fecha.dia}</Text>
            </View>
            <View style={styles.flex}>
              <ThemedText type="smallBold">
                {fecha.diaSemana} · {fecha.hora} h
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Organiza {evento.organizador.nombre} {evento.organizador.apellido}
              </ThemedText>
              {evento.organizador.puntaje === null ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Sin reseñas todavía
                </ThemedText>
              ) : (
                <View style={styles.puntaje}>
                  <Estrellas puntaje={evento.organizador.puntaje} tamanio={14} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {evento.organizador.puntaje.toFixed(1)} · {evento.organizador.cantidadResenias} reseñas
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {errorFavorito && (
            <ThemedText type="small" themeColor="peligro">
              {errorFavorito}
            </ThemedText>
          )}
          <ThemedText style={styles.descripcion}>{evento.descripcion}</ThemedText>

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
                    accessibilityRole="radio"
                    accessibilityState={{ selected: elegido, disabled: agotado }}
                    style={[
                      styles.tipo,
                      { borderColor: elegido ? theme.primario : theme.borde, opacity: agotado ? 0.5 : 1 },
                      elegido && { backgroundColor: theme.primarioSuave },
                    ]}
                  >
                    <View style={[styles.radio, { borderColor: elegido ? theme.primario : theme.borde }]}>
                      {elegido && <View style={[styles.radioPunto, { backgroundColor: theme.primario }]} />}
                    </View>
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
                    <ThemedText type="numero">{formatearPrecio(tipo.precio)}</ThemedText>
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
                      <ThemedText type="numero" style={styles.numeroCantidad}>
                        {cantidad}
                      </ThemedText>
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
                    <ThemedText type="title" themeColor="primario" style={styles.total}>
                      {formatearPrecio(tipoElegido.precio * cantidad)}
                    </ThemedText>
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
  // Apaisada: casi todas las fotos son horizontales y así se ven enteras, con logos y escenarios incluidos
  imagen: {
    aspectRatio: 5 / 4,
  },
  velo: {
    justifyContent: "flex-end",
    gap: Spacing.two,
    padding: Spacing.four - 4,
    paddingBottom: Spacing.five + Spacing.two,
    backgroundImage: VeloFoto,
  },
  categoria: {
    alignSelf: "flex-start",
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
  nombre: {
    color: "#FFFFFF",
    fontFamily: Tipografias.titulo,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  puntos: {
    flexDirection: "row",
    gap: 6,
    marginTop: Spacing.one,
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  puntoActivo: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
  cuerpo: {
    padding: Spacing.three + 4,
    marginTop: -Spacing.five,
    gap: Spacing.three + 4,
  },
  datos: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  calendario: {
    width: 60,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    alignItems: "center",
  },
  mes: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dia: {
    fontFamily: Tipografias.titulo,
    fontSize: 28,
    lineHeight: 30,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 25,
  },
  favorito: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 13, 24, 0.45)",
  },
  corazon: {
    fontSize: 20,
    lineHeight: 24,
  },
  puntaje: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radio,
    borderCurve: "continuous",
    borderWidth: 1.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    minHeight: 42,
    width: 42,
    paddingHorizontal: 0,
    borderRadius: 21,
  },
  numeroCantidad: {
    minWidth: 24,
    textAlign: "center",
  },
  total: {
    fontSize: 26,
    lineHeight: 30,
  },
});
