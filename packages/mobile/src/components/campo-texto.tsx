import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { useFondoDeCampo } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = TextInputProps & { etiqueta?: string; ayuda?: string };

// Campo relleno, sin borde; al enfocarlo aparece un contorno del color principal
export function CampoTexto({ etiqueta, ayuda, style, onFocus, onBlur, ...props }: Props) {
  const theme = useTheme();
  const fondo = useFondoDeCampo();
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.contenedor}>
      {etiqueta && <ThemedText type="etiqueta">{etiqueta}</ThemedText>}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        onFocus={(e) => {
          setEnfocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: fondo,
            borderColor: enfocado ? theme.primario : "transparent",
          },
          style,
        ]}
        {...props}
      />
      {ayuda && (
        <ThemedText type="small" themeColor="textSecondary">
          {ayuda}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Spacing.two - 2,
  },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderRadius: Radio,
    borderCurve: "continuous",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontFamily: Tipografias.texto,
    fontSize: 16,
  },
});
