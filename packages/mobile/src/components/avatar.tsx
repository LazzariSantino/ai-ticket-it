import { StyleSheet, Text, View } from "react-native";

import { Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Círculo con las iniciales de una persona, en el color suave del tema
export function Avatar({ nombre, apellido, tamanio = 40 }: { nombre: string; apellido: string; tamanio?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        { width: tamanio, height: tamanio, borderRadius: tamanio / 2, backgroundColor: theme.primarioSuave },
      ]}
    >
      <Text style={[styles.iniciales, { color: theme.primario, fontSize: tamanio * 0.38 }]}>
        {nombre[0]}
        {apellido[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  iniciales: {
    fontFamily: Tipografias.titulo,
  },
});
