import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type NombreIcono = ComponentProps<typeof Ionicons>["name"];

// Botón redondo con un ícono (favorito, compartir). Siempre lleva una etiqueta para los lectores de pantalla.
export function BotonIcono({
  icono,
  etiqueta,
  onPress,
  color,
  activo,
  tamanio = 34,
}: {
  icono: NombreIcono;
  etiqueta: string;
  onPress: () => void;
  color?: string;
  activo?: boolean;
  tamanio?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={activo === undefined ? undefined : { selected: activo }}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.boton,
        {
          width: tamanio,
          height: tamanio,
          borderRadius: tamanio / 2,
          backgroundColor: pressed ? theme.backgroundSelected : theme.background,
        },
      ]}
    >
      <Ionicons name={icono} size={tamanio * 0.53} color={color ?? theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
