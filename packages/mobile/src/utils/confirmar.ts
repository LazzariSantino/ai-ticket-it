import { Alert, Platform } from "react-native";

// Pide confirmación antes de una acción que no se puede deshacer. En web Alert no muestra botones, así que usa confirm.
export function confirmar(titulo: string, mensaje: string, textoConfirmar: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensaje, [
      { text: "Volver", style: "cancel", onPress: () => resolve(false) },
      { text: textoConfirmar, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
