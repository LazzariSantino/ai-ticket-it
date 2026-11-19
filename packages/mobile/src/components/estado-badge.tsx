import { StyleSheet, Text, View } from "react-native";

import type { EstadoCompra } from "@/api/tipos";
import { ColoresEstado, Spacing } from "@/constants/theme";

const TEXTOS: Record<EstadoCompra, string> = {
  PENDIENTE: "Pendiente de pago",
  CONFIRMADA: "Confirmada",
  UTILIZADA: "Utilizada",
  CANCELADA: "Cancelada",
  REEMBOLSADA: "Reembolsada",
};

export function textoEstado(estado: EstadoCompra) {
  return TEXTOS[estado];
}

export function EstadoBadge({ estado, grande }: { estado: EstadoCompra; grande?: boolean }) {
  const colores = ColoresEstado[estado];
  return (
    <View style={[styles.badge, grande && styles.grande, { backgroundColor: colores.fondo }]}>
      <View style={[styles.punto, { backgroundColor: colores.punto }]} />
      <Text style={[styles.texto, grande && styles.textoGrande, { color: colores.texto }]}>{TEXTOS[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
    borderRadius: 999,
  },
  grande: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  texto: {
    fontSize: 12,
    fontWeight: 700,
  },
  textoGrande: {
    fontSize: 15,
  },
});
