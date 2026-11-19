import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = TextInputProps & { etiqueta?: string; ayuda?: string };

export function CampoTexto({ etiqueta, ayuda, style, onFocus, onBlur, ...props }: Props) {
  const theme = useTheme();
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.contenedor}>
      {etiqueta && <ThemedText type="smallBold">{etiqueta}</ThemedText>}
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
            backgroundColor: theme.backgroundElement,
            borderColor: enfocado ? theme.primario : theme.borde,
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
    gap: Spacing.one + 2,
  },
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderRadius: Radio,
    borderCurve: "continuous",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
});
