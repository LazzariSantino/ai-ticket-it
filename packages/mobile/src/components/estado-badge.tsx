import { StyleSheet, Text, View } from "react-native";

import type { EstadoCompra } from "@/api/tipos";
import { ColoresEstado, Spacing, Tipografias } from "@/constants/theme";

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
      <Text style={[styles.texto, grande && styles.textoGrande, { color: colores.texto }]}>{TEXTOS[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
    borderRadius: 999,
  },
  grande: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  texto: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 12,
  },
  textoGrande: {
    fontSize: 15,
  },
});
