import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

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
import { ColoresEstado, Spacing } from "@/constants/theme";
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
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      >
        <View style={[styles.estado, { backgroundColor: ColoresEstado[compra.estado].fondo }]}>
          <EstadoBadge estado={compra.estado} grande />
          {compra.diasParaEvento !== null && (
            <ThemedText type="title" style={{ color: ColoresEstado[compra.estado].texto }}>
              {textoDiasParaEvento(compra.diasParaEvento)}
            </ThemedText>
          )}
        </View>

        <Tarjeta titulo="Evento">
          <Link href={`/evento/${compra.evento.id}`}>
            <ThemedText type="link">{compra.evento.nombre}</ThemedText>
          </Link>
          <ThemedText type="small" themeColor="textSecondary">
            {formatearFecha(compra.evento.fecha)} · Organiza {compra.evento.organizador.nombre}{" "}
            {compra.evento.organizador.apellido}
          </ThemedText>
        </Tarjeta>

        <Tarjeta titulo="Detalle">
          <Fila etiqueta="Comprador" valor={`${compra.comprador.nombre} ${compra.comprador.apellido}`} />
          <Fila etiqueta="Entrada" valor={`${compra.cantidad} × ${compra.tipoEntrada.nombre}`} />
          <Fila etiqueta="Precio unitario" valor={formatearPrecio(compra.tipoEntrada.precio)} />
          <Fila etiqueta="Total" valor={formatearPrecio(compra.total)} destacado />
          <Fila etiqueta="Fecha de compra" valor={formatearFechaHora(compra.fecha)} />
        </Tarjeta>

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
              <View style={[styles.punto, { backgroundColor: ColoresEstado[cambio.estado].texto }]} />
              <View style={styles.flex}>
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

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <View style={styles.fila}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <ThemedText type={destacado ? "smallBold" : "small"}>{valor}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  estado: {
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: 18,
  },
  aviso: {
    textAlign: "center",
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  cambio: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-start",
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
});
