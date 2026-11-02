import { ScrollView, StyleSheet, View } from "react-native";

import { URL_API } from "@/api/cliente";
import { Boton } from "@/components/boton";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSesion, useUsuario } from "@/sesion/sesion-context";

export default function PerfilScreen() {
  const usuario = useUsuario();
  const { cerrarSesion } = useSesion();
  const theme = useTheme();

  return (
    <PantallaTab titulo="Perfil">
      <ScrollView contentContainerStyle={styles.contenido}>
        <ThemedView type="backgroundElement" style={[styles.tarjeta, { borderColor: theme.borde }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primarioSuave }]}>
            <ThemedText type="subtitle" style={{ color: theme.primario }}>
              {usuario.nombre[0]}
              {usuario.apellido[0]}
            </ThemedText>
          </View>
          <View>
            <ThemedText type="subtitle">
              {usuario.nombre} {usuario.apellido}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{usuario.email}</ThemedText>
          </View>
        </ThemedView>

        <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.servidor}>
          Servidor: {URL_API}
        </ThemedText>
      </ScrollView>
    </PantallaTab>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radio,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  servidor: {
    textAlign: "center",
  },
});
