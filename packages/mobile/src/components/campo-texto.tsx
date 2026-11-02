import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = TextInputProps & { etiqueta?: string; ayuda?: string };

export function CampoTexto({ etiqueta, ayuda, style, ...props }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.contenedor}>
      {etiqueta && <ThemedText type="smallBold">{etiqueta}</ThemedText>}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.borde },
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
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radio,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
