import { StyleSheet, Text, View } from "react-native";

import type { CambioEstadoCompra, EstadoCompra } from "@/api/tipos";
import { textoEstado } from "@/components/estado-badge";
import { ThemedText } from "@/components/themed-text";
import { ColoresEstado, Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Los dos caminos posibles de una compra, igual que la tabla de transiciones del backend:
// el normal, y la cancelación (a la que se llega desde Pendiente o desde Confirmada)
const CAMINO_NORMAL: EstadoCompra[] = ["PENDIENTE", "CONFIRMADA", "UTILIZADA"];
const CAMINO_CANCELACION: EstadoCompra[] = ["CANCELADA", "REEMBOLSADA"];

const NOMBRE_CORTO: Record<EstadoCompra, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  UTILIZADA: "Utilizada",
  CANCELADA: "Cancelada",
  REEMBOLSADA: "Reembolsada",
};

const TAMANIO = 30;

const fechaCorta = (iso: string) => {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fecha.getDate()}/${fecha.getMonth() + 1} · ${hora}`;
};

// Todos los estados de la compra en horizontal: los que ya pasaron con su fecha, el actual resaltado
// y los que todavía no ocurrieron en gris
export function RecorridoEstados({
  historial,
  estadoActual,
}: {
  historial: CambioEstadoCompra[];
  estadoActual: EstadoCompra;
}) {
  const theme = useTheme();
  const cambioDe = (estado: EstadoCompra) => [...historial].reverse().find((cambio) => cambio.estado === estado);
  const actual = cambioDe(estadoActual);
  const seCancelo = CAMINO_CANCELACION.includes(estadoActual);

  // `huecos` deja columnas vacías al principio para que la rama de cancelación quede alineada debajo del camino normal
  const camino = (estados: EstadoCompra[], huecos = 0) => (
    <View style={styles.camino}>
      {Array.from({ length: huecos }, (_, i) => (
        <View key={`hueco${i}`} style={styles.paso} />
      ))}
      {estados.map((estado, indice) => {
        const cambio = cambioDe(estado);
        const siguienteAlcanzado = indice < estados.length - 1 && !!cambioDe(estados[indice + 1]);
        return (
          <View key={estado} style={styles.paso}>
            {indice < estados.length - 1 && (
              <View
                style={[
                  styles.linea,
                  { backgroundColor: siguienteAlcanzado ? ColoresEstado[estados[indice + 1]].texto : theme.borde },
                ]}
              />
            )}
            <Paso estado={estado} alcanzado={!!cambio} esActual={estado === estadoActual} fecha={cambio?.fechaHora} />
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.contenedor} accessibilityLabel={`Estado actual: ${textoEstado(estadoActual)}`}>
      {camino(CAMINO_NORMAL)}

      <View style={[styles.rama, { borderColor: theme.borde, opacity: seCancelo ? 1 : 0.75 }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {seCancelo ? "La compra se canceló" : "Si se cancela"}
        </ThemedText>
        {camino(CAMINO_CANCELACION, CAMINO_NORMAL.length - CAMINO_CANCELACION.length)}
      </View>

      {actual && (
        <View style={[styles.resumen, { backgroundColor: ColoresEstado[estadoActual].fondo }]}>
          <Text style={[styles.resumenTexto, { color: ColoresEstado[estadoActual].texto }]}>
            {textoEstado(estadoActual)} desde el {fechaCorta(actual.fechaHora)} h
            {actual.quien
              ? ` · por ${actual.quien.nombre} ${actual.quien.apellido}`
              : " · automático: venció el plazo de pago"}
          </Text>
        </View>
      )}
    </View>
  );
}

function Paso({
  estado,
  alcanzado,
  esActual,
  fecha,
}: {
  estado: EstadoCompra;
  alcanzado: boolean;
  esActual: boolean;
  fecha?: string;
}) {
  const theme = useTheme();
  const color = ColoresEstado[estado];

  return (
    <View style={styles.columna} accessibilityLabel={`${NOMBRE_CORTO[estado]}${alcanzado ? ", alcanzado" : ""}`}>
      <View
        style={[
          styles.circulo,
          alcanzado
            ? { backgroundColor: color.texto }
            : { backgroundColor: theme.background, borderWidth: 2, borderColor: theme.borde },
          esActual && { borderWidth: 5, borderColor: color.fondo, transform: [{ scale: 1.15 }] },
        ]}
      >
        {alcanzado && <Text style={styles.marca}>{esActual ? "●" : "✓"}</Text>}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.nombre,
          { color: esActual ? color.texto : alcanzado ? theme.text : theme.textSecondary },
          esActual && styles.nombreActual,
        ]}
      >
        {NOMBRE_CORTO[estado]}
      </Text>
      <Text style={[styles.fecha, { color: theme.textSecondary }]}>{fecha ? fechaCorta(fecha) : " "}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Spacing.three,
  },
  camino: {
    flexDirection: "row",
  },
  // Todas las columnas miden lo mismo, así los dos caminos quedan alineados
  paso: {
    flex: 1,
    alignItems: "center",
  },
  // Va del centro de un círculo al centro del siguiente, dejando un espacio alrededor de cada uno
  linea: {
    position: "absolute",
    height: 3,
    borderRadius: 2,
    top: TAMANIO / 2 - 1.5,
    left: "50%",
    right: "-50%",
    marginLeft: TAMANIO / 2 + 4,
    marginRight: TAMANIO / 2 + 4,
  },
  columna: {
    width: "100%",
    alignItems: "center",
    gap: 4,
  },
  circulo: {
    width: TAMANIO,
    height: TAMANIO,
    borderRadius: TAMANIO / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  marca: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Tipografias.titulo,
  },
  nombre: {
    fontFamily: Tipografias.destacado,
    fontSize: 12,
    marginTop: 2,
  },
  nombreActual: {
    fontFamily: Tipografias.titulo,
    fontSize: 13,
  },
  fecha: {
    fontFamily: Tipografias.texto,
    fontSize: 11,
  },
  rama: {
    gap: Spacing.two,
    paddingTop: Spacing.three - 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  resumen: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: 16,
  },
  resumenTexto: {
    fontFamily: Tipografias.destacado,
    fontSize: 13,
    lineHeight: 18,
  },
});
