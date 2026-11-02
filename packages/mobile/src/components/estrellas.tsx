import { Pressable, StyleSheet, Text, View } from "react-native";

const COLOR_ESTRELLA = "#F5A524";

// Muestra un puntaje de 1 a 5. Si recibe onCambiar, las estrellas se pueden tocar para elegir el puntaje.
export function Estrellas({
  puntaje,
  tamanio = 16,
  onCambiar,
}: {
  puntaje: number;
  tamanio?: number;
  onCambiar?: (puntaje: number) => void;
}) {
  return (
    <View style={styles.fila} accessibilityLabel={`${puntaje} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((valor) => {
        const simbolo = valor <= Math.round(puntaje) ? "★" : "☆";
        const estrella = (
          <Text key={valor} style={{ fontSize: tamanio, lineHeight: tamanio * 1.25, color: COLOR_ESTRELLA }}>
            {simbolo}
          </Text>
        );
        return onCambiar ? (
          <Pressable key={valor} onPress={() => onCambiar(valor)} hitSlop={6} accessibilityRole="button">
            {estrella}
          </Pressable>
        ) : (
          estrella
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    gap: 2,
  },
});
