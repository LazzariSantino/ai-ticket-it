import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { cancelar, marcarUtilizada, obtenerCompra, pagar } from "@/api/compras";
import type { Compra } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { EstadoBadge, textoEstado } from "@/components/estado-badge";
import { Cargando, ErrorPantalla } from "@/components/estado-pantalla";
import { FormularioResenia } from "@/components/formulario-resenia";
import { ReseniaItem } from "@/components/resenia-item";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Troquel } from "@/components/troquel";
import { ColoresEstado, RadioGrande, Spacing, Tipografias, VeloFoto } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useUsuario } from "@/sesion/sesion-context";
import { confirmar } from "@/utils/confirmar";
import { formatearFecha, formatearFechaHora, formatearPrecio, textoDiasParaEvento } from "@/utils/formato";

export default function CompraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const usuario = useUsuario();
  const theme = useTheme();
  const { datos: compra, setDatos, error, cargando, recargando, recargar } = useConsulta(() => obtenerCompra(id), [id]);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (cargando) return <Cargando />;
  if (error || !compra) return <ErrorPantalla mensaje={error ?? "No se encontró la compra"} onReintentar={recargar} />;

  const soyComprador = compra.comprador.id === usuario.id;
  const soyOrganizador = compra.evento.organizador.id === usuario.id;

  async function ejecutar(nombre: string, accion: () => Promise<Compra>) {
    setAccionEnCurso(nombre);
    setErrorAccion(null);
    try {
      setDatos(await accion());
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo completar la acción");
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function pedirCancelacion() {
    if (!compra) return;
    const conReembolso = compra.estado === "CONFIRMADA";
    const confirmado = await confirmar(
      "¿Cancelar la compra?",
      conReembolso
        ? `Se te van a reembolsar ${formatearPrecio(compra.total)} y las entradas vuelven a estar a la venta.`
        : "Las entradas vuelven a estar a la venta.",
      "Cancelar compra",
    );
    if (confirmado) {
      await ejecutar("cancelar", () => cancelar(compra.id));
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: `Compra #${compra.id}` }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      >
        {/* La compra se muestra como la entrada: foto del evento, estado, troquel y el talón con los datos */}
        <View
          style={[
            styles.entrada,
            { backgroundColor: theme.backgroundElement, borderColor: theme.borde, boxShadow: theme.sombra },
          ]}
        >
          <Pressable accessibilityRole="link" onPress={() => router.push(`/evento/${compra.evento.id}`)}>
            <Image
              source={compra.evento.multimedia[0]}
              style={[styles.foto, { backgroundColor: theme.primarioSuave }]}
              contentFit="cover"
              transition={250}
            />
            <View style={[StyleSheet.absoluteFill, styles.velo]}>
              <Text style={styles.evento} numberOfLines={2}>
                {compra.evento.nombre}
              </Text>
              <Text style={styles.cuando}>{formatearFecha(compra.evento.fecha)} · Ver evento ›</Text>
            </View>
          </Pressable>

          <View style={styles.estado}>
            <EstadoBadge estado={compra.estado} grande />
            {compra.diasParaEvento !== null && (
              <ThemedText type="title" themeColor="acento" style={styles.dias}>
                {textoDiasParaEvento(compra.diasParaEvento)}
              </ThemedText>
            )}
          </View>

          <Troquel />

          <View style={styles.talon}>
            <View style={styles.grilla}>
              <Dato etiqueta="Entrada" valor={compra.tipoEntrada.nombre} />
              <Dato etiqueta="Cantidad" valor={String(compra.cantidad)} />
              <Dato etiqueta="Precio unitario" valor={formatearPrecio(compra.tipoEntrada.precio)} />
              <Dato etiqueta="Total" valor={formatearPrecio(compra.total)} destacado />
              <Dato etiqueta="Comprador" valor={`${compra.comprador.nombre} ${compra.comprador.apellido}`} />
              <Dato
                etiqueta="Organiza"
                valor={`${compra.evento.organizador.nombre} ${compra.evento.organizador.apellido}`}
              />
            </View>
            <CodigoDeBarras semilla={compra.id} />
            <ThemedText type="etiqueta" themeColor="textSecondary" style={styles.codigo}>
              N.º {String(compra.id).padStart(6, "0")} · Comprada el {formatearFechaHora(compra.fecha)}
            </ThemedText>
          </View>
        </View>

        {compra.venceElPago && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.aviso}>
            {soyComprador ? "Pagala antes del" : "El comprador tiene tiempo de pagar hasta el"}{" "}
            {formatearFechaHora(compra.venceElPago)}. Si no, se cancela sola y las entradas vuelven a estar a la venta.
          </ThemedText>
        )}

        {errorAccion && (
          <ThemedText type="small" themeColor="peligro">
            {errorAccion}
          </ThemedText>
        )}

        {soyComprador && compra.estado === "PENDIENTE" && (
          <Boton
            titulo={`Pagar ${formatearPrecio(compra.total)}`}
            onPress={() => ejecutar("pagar", () => pagar(compra.id))}
            cargando={accionEnCurso === "pagar"}
          />
        )}
        {soyOrganizador && compra.estado === "CONFIRMADA" && (
          <Boton
            titulo="Validar entrada (marcar como utilizada)"
            onPress={() => ejecutar("usar", () => marcarUtilizada(compra.id))}
            cargando={accionEnCurso === "usar"}
          />
        )}
        {soyComprador && compra.puedeCancelarse && (
          <Boton
            titulo={compra.estado === "CONFIRMADA" ? "Cancelar y pedir reembolso" : "Cancelar compra"}
            variante="peligro"
            onPress={pedirCancelacion}
            cargando={accionEnCurso === "cancelar"}
          />
        )}

        {soyComprador && compra.puedeSerReseniada && (
          <FormularioResenia
            compraId={compra.id}
            onReseniada={(resenia) => setDatos({ ...compra, resenia, puedeSerReseniada: false })}
          />
        )}
        {compra.resenia && (
          <Tarjeta titulo={soyComprador ? "Tu reseña" : "Reseña del comprador"}>
            <ReseniaItem resenia={compra.resenia} />
          </Tarjeta>
        )}

        <Boton
          titulo={`${soyComprador ? "Chatear con el organizador" : "Chatear con el comprador"} (${compra.cantidadMensajes})`}
          variante="secundario"
          onPress={() => router.push(`/compra/${compra.id}/chat`)}
        />

        <Tarjeta titulo="Historial">
          {compra.historial.map((cambio, indice) => (
            <View key={indice} style={styles.cambio}>
              <View style={styles.linea}>
                <View style={[styles.punto, { backgroundColor: ColoresEstado[cambio.estado].punto }]} />
                {indice < compra.historial.length - 1 && (
                  <View style={[styles.trazo, { backgroundColor: theme.borde }]} />
                )}
              </View>
              <View style={[styles.flex, styles.cambioTexto]}>
                <ThemedText type="smallBold">{textoEstado(cambio.estado)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatearFechaHora(cambio.fechaHora)} ·{" "}
                  {cambio.quien
                    ? `${cambio.quien.nombre} ${cambio.quien.apellido}`
                    : "Sistema (venció el plazo de pago)"}
                </ThemedText>
              </View>
            </View>
          ))}
        </Tarjeta>
      </ScrollView>
    </ThemedView>
  );
}

function Dato({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <View style={styles.dato}>
      <ThemedText type="etiqueta" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <ThemedText type={destacado ? "numero" : "smallBold"} themeColor={destacado ? "primario" : "text"}>
        {valor}
      </ThemedText>
    </View>
  );
}

// Un código de barras decorativo, siempre igual para la misma compra (no se escanea: es parte del diseño de la entrada)
function CodigoDeBarras({ semilla }: { semilla: number }) {
  const theme = useTheme();
  const barras = Array.from({ length: 42 }, (_, i) => 1 + ((semilla * 7 + i * 13 + ((i * i) % 5)) % 4));
  return (
    <View style={styles.barras} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {barras.map((ancho, i) => (
        <View key={i} style={{ width: ancho, backgroundColor: i % 2 === 0 ? theme.text : "transparent" }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: Spacing.three + 4,
    gap: Spacing.three + 4,
    paddingBottom: Spacing.six,
  },
  entrada: {
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  velo: {
    justifyContent: "flex-end",
    padding: Spacing.three,
    backgroundImage: VeloFoto,
  },
  evento: {
    color: "#FFFFFF",
    fontFamily: Tipografias.titulo,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  cuando: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontWeight: 500,
  },
  estado: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.four - 4,
    paddingHorizontal: Spacing.three,
  },
  dias: {
    textAlign: "center",
  },
  talon: {
    padding: Spacing.three + 2,
    gap: Spacing.three,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Spacing.three,
  },
  dato: {
    width: "50%",
    gap: 2,
    paddingRight: Spacing.two,
  },
  barras: {
    flexDirection: "row",
    justifyContent: "center",
    height: 44,
    gap: 1,
    marginTop: Spacing.one,
  },
  codigo: {
    textAlign: "center",
  },
  aviso: {
    textAlign: "center",
  },
  cambio: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  linea: {
    alignItems: "center",
    width: 12,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  trazo: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  cambioTexto: {
    paddingBottom: Spacing.three,
  },
});
