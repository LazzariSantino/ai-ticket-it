import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { urlImagen } from "@/api/cliente";
import { cancelar, marcarUtilizada, obtenerCompra, pagar } from "@/api/compras";
import type { Compra } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { textoEstado } from "@/components/estado-badge";
import { Cargando, ErrorPantalla } from "@/components/estado-pantalla";
import { FormularioResenia } from "@/components/formulario-resenia";
import { RecorridoEstados } from "@/components/recorrido-estados";
import { ReseniaItem } from "@/components/resenia-item";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ColoresEstado, Radio, RadioGrande, Spacing, Tipografias } from "@/constants/theme";
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
        <View style={[styles.estado, { backgroundColor: ColoresEstado[compra.estado].fondo }]}>
          <Text style={[styles.estadoTexto, { color: ColoresEstado[compra.estado].texto }]}>
            {textoEstado(compra.estado)}
          </Text>
          {compra.diasParaEvento !== null && (
            <Text style={[styles.dias, { color: ColoresEstado[compra.estado].texto }]}>
              {textoDiasParaEvento(compra.diasParaEvento)}
            </Text>
          )}
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(`/evento/${compra.evento.id}`)}
          style={({ pressed }) => [
            styles.evento,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}
        >
          <Image
            source={urlImagen(compra.evento.multimedia[0])}
            style={[styles.foto, { backgroundColor: theme.primarioSuave }]}
            contentFit="cover"
            contentPosition="top"
            transition={200}
          />
          <View style={styles.flex}>
            <ThemedText type="smallBold" style={styles.nombreEvento} numberOfLines={2}>
              {compra.evento.nombre}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatearFecha(compra.evento.fecha)}
            </ThemedText>
            <ThemedText type="link">Ver evento ›</ThemedText>
          </View>
        </Pressable>

        <Tarjeta titulo="Detalle de la compra">
          <Fila etiqueta="Entrada" valor={compra.tipoEntrada.nombre} />
          <Fila etiqueta="Cantidad" valor={String(compra.cantidad)} />
          <Fila etiqueta="Precio unitario" valor={formatearPrecio(compra.tipoEntrada.precio)} />
          <Fila etiqueta="Comprador" valor={`${compra.comprador.nombre} ${compra.comprador.apellido}`} />
          <Fila
            etiqueta="Organiza"
            valor={`${compra.evento.organizador.nombre} ${compra.evento.organizador.apellido}`}
          />
          <View style={[styles.separador, { backgroundColor: theme.borde }]} />
          <View style={styles.fila}>
            <ThemedText type="smallBold">Total</ThemedText>
            <ThemedText type="numero" themeColor="primario">
              {formatearPrecio(compra.total)}
            </ThemedText>
          </View>
        </Tarjeta>
        <ThemedText type="small" themeColor="textSecondary" style={styles.aviso}>
          Compra N.º {String(compra.id).padStart(6, "0")} · {formatearFechaHora(compra.fecha)}
        </ThemedText>

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
            titulo="Validar entrada"
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

        <Tarjeta titulo="Recorrido de la compra">
          <RecorridoEstados historial={compra.historial} estadoActual={compra.estado} />
        </Tarjeta>
      </ScrollView>
    </ThemedView>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.fila}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.valor}>
        {valor}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: Spacing.four - 4,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  estado: {
    alignItems: "center",
    gap: 2,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  estadoTexto: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 16,
  },
  dias: {
    fontFamily: Tipografias.titulo,
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
  },
  evento: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three - 2,
    padding: Spacing.two + 2,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  foto: {
    width: 76,
    height: 76,
    borderRadius: Radio,
  },
  nombreEvento: {
    fontSize: 16,
    lineHeight: 21,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.three,
  },
  valor: {
    flexShrink: 1,
    textAlign: "right",
  },
  separador: {
    height: StyleSheet.hairlineWidth,
  },
  aviso: {
    textAlign: "center",
  },
});
