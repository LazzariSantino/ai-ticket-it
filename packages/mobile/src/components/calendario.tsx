import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HojaInferior } from "@/components/hoja-inferior";
import { ThemedText } from "@/components/themed-text";
import { Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

const inicioDelDia = (fecha: Date) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
const mismoDia = (a: Date | null, b: Date) => !!a && inicioDelDia(a).getTime() === inicioDelDia(b).getTime();

// Las celdas del mes empezando el lunes: null para los huecos antes del día 1
function celdasDelMes(anio: number, mes: number) {
  const huecos = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const cantidadDias = new Date(anio, mes + 1, 0).getDate();
  return [
    ...Array.from({ length: huecos }, () => null),
    ...Array.from({ length: cantidadDias }, (_, i) => new Date(anio, mes, i + 1)),
  ];
}

// Calendario en una hoja que sube desde abajo. Los días anteriores a `minimo` no se pueden elegir.
export function Calendario({
  visible,
  valor,
  minimo,
  onElegir,
  onCerrar,
}: {
  visible: boolean;
  valor: Date | null;
  minimo: Date;
  onElegir: (fecha: Date) => void;
  onCerrar: () => void;
}) {
  const theme = useTheme();
  const base = valor ?? minimo;
  const [mesVisible, setMesVisible] = useState({ anio: base.getFullYear(), mes: base.getMonth() });
  const hoy = new Date();
  const primerDiaPermitido = inicioDelDia(minimo);

  const titulo = new Date(mesVisible.anio, mesVisible.mes, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const hayMesAnterior =
    mesVisible.anio > minimo.getFullYear() ||
    (mesVisible.anio === minimo.getFullYear() && mesVisible.mes > minimo.getMonth());

  const moverMes = (delta: number) => {
    const fecha = new Date(mesVisible.anio, mesVisible.mes + delta, 1);
    setMesVisible({ anio: fecha.getFullYear(), mes: fecha.getMonth() });
  };

  return (
    <HojaInferior visible={visible} titulo="Elegí el día" onCerrar={onCerrar}>
      <View style={styles.encabezado}>
        <BotonMes texto="‹" etiqueta="Mes anterior" deshabilitado={!hayMesAnterior} onPress={() => moverMes(-1)} />
        <ThemedText type="subtitle" style={styles.mes}>
          {titulo.charAt(0).toUpperCase() + titulo.slice(1)}
        </ThemedText>
        <BotonMes texto="›" etiqueta="Mes siguiente" onPress={() => moverMes(1)} />
      </View>

      <View style={styles.grilla}>
        {DIAS_SEMANA.map((dia, i) => (
          <View key={`d${i}`} style={styles.celda}>
            <ThemedText type="etiqueta" themeColor="textSecondary">
              {dia}
            </ThemedText>
          </View>
        ))}
        {celdasDelMes(mesVisible.anio, mesVisible.mes).map((fecha, i) => {
          if (!fecha) return <View key={`h${i}`} style={styles.celda} />;
          const pasado = fecha < primerDiaPermitido;
          const elegido = mismoDia(valor, fecha);
          const esHoy = mismoDia(hoy, fecha);
          return (
            <View key={fecha.toISOString()} style={styles.celda}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={fecha.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                accessibilityState={{ selected: elegido, disabled: pasado }}
                disabled={pasado}
                onPress={() => {
                  onElegir(fecha);
                  onCerrar();
                }}
                style={({ pressed }) => [
                  styles.dia,
                  elegido && { backgroundColor: theme.primario },
                  !elegido && esHoy && { borderWidth: 1.5, borderColor: theme.primario },
                  !elegido && pressed && { backgroundColor: theme.primarioSuave },
                ]}
              >
                <Text
                  style={[styles.numero, { color: elegido ? theme.sobrePrimario : pasado ? theme.borde : theme.text }]}
                >
                  {fecha.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </HojaInferior>
  );
}

function BotonMes({
  texto,
  etiqueta,
  deshabilitado,
  onPress,
}: {
  texto: string;
  etiqueta: string;
  deshabilitado?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      disabled={deshabilitado}
      onPress={onPress}
      style={[styles.botonMes, { backgroundColor: theme.backgroundElement, opacity: deshabilitado ? 0.35 : 1 }]}
    >
      <Text style={[styles.flecha, { color: theme.primario }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  mes: {
    fontSize: 18,
  },
  botonMes: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  flecha: {
    fontFamily: Tipografias.titulo,
    fontSize: 22,
    lineHeight: 26,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: Spacing.two,
  },
  celda: {
    width: `${100 / 7}%`,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  dia: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  numero: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 16,
  },
});
