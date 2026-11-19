import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Panel que sube desde abajo sobre un fondo oscurecido. Se cierra tocando afuera o con "atrás" en Android.
// Lo usan el desplegable y el calendario.
export function HojaInferior({
  visible,
  titulo,
  onCerrar,
  children,
}: {
  visible: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.contenedor}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.velo }]}
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <View
          style={[
            styles.hoja,
            { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, Spacing.three) },
          ]}
        >
          <View style={[styles.manija, { backgroundColor: theme.borde }]} />
          <ThemedText type="subtitle" style={styles.titulo}>
            {titulo}
          </ThemedText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
  },
  hoja: {
    borderTopLeftRadius: RadioGrande,
    borderTopRightRadius: RadioGrande,
    paddingHorizontal: Spacing.four - 4,
    paddingTop: Spacing.two + 2,
    maxHeight: "80%",
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  manija: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: Spacing.three,
  },
  titulo: {
    marginBottom: Spacing.two,
  },
});
