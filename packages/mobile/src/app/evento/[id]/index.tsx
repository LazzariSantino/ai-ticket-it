import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { urlImagen } from "@/api/cliente";
import { comprar } from "@/api/compras";
import { agregarFavorito, obtenerEvento, quitarFavorito } from "@/api/eventos";
import type { TipoEntrada } from "@/api/tipos";
import { Avatar } from "@/components/avatar";
import { Boton } from "@/components/boton";
import { Cargando, ErrorPantalla } from "@/components/estado-pantalla";
import { Estrellas } from "@/components/estrellas";
import { ReseniaItem } from "@/components/resenia-item";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, RadioGrande, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useSesion } from "@/sesion/sesion-context";
import { formatearPrecio, partesDeFecha } from "@/utils/formato";

// Margen lateral de la pantalla: la foto ocupa el ancho que queda
const MARGEN = 20;

// El mismo tope que valida el backend (MAXIMO_ENTRADAS_POR_COMPRA)
const MAXIMO_POR_COMPRA = 10;

export default function EventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const anchoFoto = width - MARGEN * 2;
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
          headerRight: () => (
            <Pressable
              onPress={alternarFavorito}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={evento.esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <Text style={[styles.corazon, { color: evento.esFavorito ? theme.peligro : theme.text }]}>
                {evento.esFavorito ? "♥" : "♡"}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.contenido}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carrusel}
            onMomentumScrollEnd={(e) => setFoto(Math.round(e.nativeEvent.contentOffset.x / anchoFoto))}
          >
            {evento.multimedia.map((url) => (
              <Image
                key={url}
                source={urlImagen(url)}
                style={[styles.imagen, { width: anchoFoto, backgroundColor: theme.primarioSuave }]}
                contentFit="cover"
                transition={250}
              />
            ))}
          </ScrollView>
          {evento.multimedia.length > 1 && (
            <View style={styles.puntos}>
              {evento.multimedia.map((url, indice) => (
                <View
                  key={url}
                  style={[
                    styles.punto,
                    { backgroundColor: indice === foto ? theme.primario : theme.borde },
                    indice === foto && styles.puntoActivo,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.titulos}>
          <ThemedText type="etiqueta" themeColor="primario">
            {evento.categoria.nombre}
          </ThemedText>
          <ThemedText type="title">{evento.nombre}</ThemedText>
        </View>

        <Tarjeta>
          <Dato
            icono="📅"
            titulo={`${fecha.diaSemana} ${fecha.dia} de ${fecha.mesLargo}`}
            detalle={`${fecha.hora} h`}
          />
          <View style={[styles.separador, { backgroundColor: theme.borde }]} />
          <View style={styles.dato}>
            <Avatar nombre={evento.organizador.nombre} apellido={evento.organizador.apellido} tamanio={42} />
            <View style={styles.flex}>
              <ThemedText type="smallBold">
                {evento.organizador.nombre} {evento.organizador.apellido}
              </ThemedText>
              {evento.organizador.puntaje === null ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Organizador · sin reseñas todavía
                </ThemedText>
              ) : (
                <View style={styles.puntaje}>
                  <Estrellas puntaje={evento.organizador.puntaje} tamanio={13} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {evento.organizador.puntaje.toFixed(1)} · {evento.organizador.cantidadResenias} reseñas
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </Tarjeta>

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
                    {
                      backgroundColor: elegido ? theme.primarioSuave : theme.background,
                      borderColor: elegido ? theme.primario : "transparent",
                      opacity: agotado ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.flex}>
                    <ThemedText type="smallBold" style={styles.nombreTipo}>
                      {tipo.nombre}
                    </ThemedText>
                    {tipo.descripcion ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {tipo.descripcion}
                      </ThemedText>
                    ) : null}
                    <ThemedText type="small" themeColor={agotado ? "peligro" : "textSecondary"}>
                      {agotado
                        ? "Agotado"
                        : tipo.cupoDisponible <= 10
                          ? `¡Últimas ${tipo.cupoDisponible}!`
                          : `Quedan ${tipo.cupoDisponible}`}
                    </ThemedText>
                  </View>
                  <ThemedText type="numero" themeColor={elegido ? "primario" : "text"}>
                    {formatearPrecio(tipo.precio)}
                  </ThemedText>
                </Pressable>
              );
            })}

            {tipoElegido && (
              <>
                <View style={styles.cantidad}>
                  <ThemedText type="smallBold">Cantidad</ThemedText>
                  <View style={[styles.selector, { backgroundColor: theme.background }]}>
                    <BotonCantidad
                      texto="−"
                      etiqueta="Una entrada menos"
                      deshabilitado={cantidad <= 1}
                      onPress={() => setCantidad(cantidad - 1)}
                    />
                    <ThemedText type="numero" style={styles.numeroCantidad}>
                      {cantidad}
                    </ThemedText>
                    <BotonCantidad
                      texto="+"
                      etiqueta="Una entrada más"
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
              titulo={
                tipoElegido
                  ? `Comprar ${cantidad === 1 ? "entrada" : `${cantidad} entradas`}`
                  : "Elegí un tipo de entrada"
              }
              onPress={confirmarCompra}
              cargando={comprando}
              deshabilitado={!tipoElegido}
            />
          </Tarjeta>
        )}

        <Tarjeta titulo={`Qué dicen de los eventos de ${evento.organizador.nombre}`}>
          {evento.reseniasDelOrganizador.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Todavía nadie reseñó sus eventos.
            </ThemedText>
          ) : (
            evento.reseniasDelOrganizador.map((resenia) => <ReseniaItem key={resenia.id} resenia={resenia} />)
          )}
        </Tarjeta>
      </ScrollView>
    </ThemedView>
  );
}

function Dato({ icono, titulo, detalle }: { icono: string; titulo: string; detalle: string }) {
  const theme = useTheme();
  return (
    <View style={styles.dato}>
      <View style={[styles.icono, { backgroundColor: theme.primarioSuave }]}>
        <Text style={styles.iconoTexto}>{icono}</Text>
      </View>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{titulo}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {detalle}
        </ThemedText>
      </View>
    </View>
  );
}

function BotonCantidad({
  texto,
  etiqueta,
  deshabilitado,
  onPress,
}: {
  texto: string;
  etiqueta: string;
  deshabilitado: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      disabled={deshabilitado}
      onPress={onPress}
      style={[styles.botonCantidad, { backgroundColor: theme.primarioSuave, opacity: deshabilitado ? 0.4 : 1 }]}
    >
      <Text style={[styles.signo, { color: theme.primario }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: MARGEN,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  carrusel: {
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  imagen: {
    aspectRatio: 4 / 3,
  },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.two + 2,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  puntoActivo: {
    width: 20,
  },
  titulos: {
    gap: 2,
  },
  dato: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - 4,
  },
  icono: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoTexto: {
    fontSize: 18,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
  },
  descripcion: {
    lineHeight: 25,
  },
  corazon: {
    fontSize: 26,
    lineHeight: 30,
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
    borderWidth: 2,
  },
  nombreTipo: {
    fontSize: 16,
  },
  cantidad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: 4,
    borderRadius: 999,
  },
  botonCantidad: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  signo: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 600,
  },
  numeroCantidad: {
    minWidth: 28,
    textAlign: "center",
  },
  total: {
    fontSize: 26,
    lineHeight: 32,
  },
});
