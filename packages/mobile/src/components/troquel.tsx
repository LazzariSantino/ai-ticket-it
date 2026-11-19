import { StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

const MUESCA = 18;

// La línea punteada con dos muescas que separa las partes de una entrada de papel.
// Las muescas se pintan del color del fondo de la pantalla, así parecen recortadas en la tarjeta.
export function Troquel({ vertical = false }: { vertical?: boolean }) {
  const theme = useTheme();
  const muesca = [styles.muesca, { backgroundColor: theme.background, borderColor: theme.borde }];

  if (vertical) {
    return (
      <View style={styles.vertical}>
        <View style={[muesca, styles.arriba]} />
        <View style={[styles.lineaVertical, { borderColor: theme.borde }]} />
        <View style={[muesca, styles.abajo]} />
      </View>
    );
  }

  return (
    <View style={styles.horizontal}>
      <View style={[muesca, styles.izquierda]} />
      <View style={[styles.lineaHorizontal, { borderColor: theme.borde }]} />
      <View style={[muesca, styles.derecha]} />
    </View>
  );
}

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    height: MUESCA,
  },
  vertical: {
    alignItems: "center",
    width: MUESCA,
  },
  muesca: {
    width: MUESCA,
    height: MUESCA,
    borderRadius: MUESCA / 2,
    borderWidth: 1,
  },
  izquierda: {
    marginLeft: -MUESCA / 2,
  },
  derecha: {
    marginRight: -MUESCA / 2,
  },
  arriba: {
    marginTop: -MUESCA / 2,
  },
  abajo: {
    marginBottom: -MUESCA / 2,
  },
  lineaHorizontal: {
    flex: 1,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    marginHorizontal: 6,
  },
  lineaVertical: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    marginVertical: 6,
  },
});
