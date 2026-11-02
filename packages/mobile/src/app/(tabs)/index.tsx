import { StyleSheet } from "react-native";

import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useUsuario } from "@/sesion/sesion-context";

export default function ExplorarScreen() {
  const usuario = useUsuario();

  return (
    <PantallaTab titulo="Explorar">
      <ThemedText style={styles.texto}>¡Hola, {usuario.nombre}!</ThemedText>
    </PantallaTab>
  );
}

const styles = StyleSheet.create({
  texto: {
    paddingHorizontal: Spacing.three,
  },
});
