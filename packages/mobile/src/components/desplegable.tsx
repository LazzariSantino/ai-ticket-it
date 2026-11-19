import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { HojaInferior } from "@/components/hoja-inferior";
import { useFondoDeCampo } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing, Tipografias } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type Opcion<T> = { valor: T; texto: string };

const ALTO_OPCION = 52;

// Campo que muestra un valor y, al tocarlo, abre algo para elegirlo. Lo usan el desplegable y el campo de fecha.
export function CampoSeleccion({
  etiqueta,
  texto,
  placeholder,
  onPress,
  compacto,
}: {
  etiqueta?: string;
  texto?: string;
  placeholder?: string;
  onPress: () => void;
  compacto?: boolean;
}) {
  const theme = useTheme();
  const fondo = useFondoDeCampo();
  return (
    <View style={styles.grupo}>
      {etiqueta && !compacto && <ThemedText type="etiqueta">{etiqueta}</ThemedText>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta ?? ""} ${texto ?? placeholder ?? ""}`.trim()}
        onPress={onPress}
        style={({ pressed }) => [styles.campo, { backgroundColor: pressed ? theme.backgroundSelected : fondo }]}
      >
        <View style={styles.textos}>
          {etiqueta && compacto && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.etiquetaCompacta}>
              {etiqueta}
            </ThemedText>
          )}
          <Text numberOfLines={1} style={[styles.valor, { color: texto ? theme.text : theme.textSecondary }]}>
            {texto ?? placeholder}
          </Text>
        </View>
        <Text style={[styles.flecha, { color: theme.primario }]}>▾</Text>
      </Pressable>
    </View>
  );
}

// Desplegable: elegir una opción de una lista que sube desde abajo, con la elegida marcada
export function Desplegable<T extends string | number | undefined>({
  etiqueta,
  titulo,
  valor,
  opciones,
  onCambiar,
  placeholder = "Elegí una opción",
  compacto,
}: {
  etiqueta?: string;
  titulo?: string;
  valor: T | null;
  opciones: Opcion<T>[];
  onCambiar: (valor: T) => void;
  placeholder?: string;
  compacto?: boolean;
}) {
  const theme = useTheme();
  const [abierto, setAbierto] = useState(false);
  const indiceElegido = opciones.findIndex((opcion) => opcion.valor === valor);

  return (
    <>
      <CampoSeleccion
        etiqueta={etiqueta}
        texto={opciones[indiceElegido]?.texto}
        placeholder={placeholder}
        onPress={() => setAbierto(true)}
        compacto={compacto}
      />
      <HojaInferior visible={abierto} titulo={titulo ?? etiqueta ?? placeholder} onCerrar={() => setAbierto(false)}>
        <FlatList
          data={opciones}
          keyExtractor={(opcion) => String(opcion.valor)}
          // Con listas largas (como las horas) abre ya mostrando la opción elegida
          initialScrollIndex={indiceElegido > 3 ? indiceElegido - 2 : undefined}
          getItemLayout={(_, indice) => ({ length: ALTO_OPCION, offset: ALTO_OPCION * indice, index: indice })}
          renderItem={({ item }) => {
            const elegida = item.valor === valor;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: elegida }}
                onPress={() => {
                  onCambiar(item.valor);
                  setAbierto(false);
                }}
                style={({ pressed }) => [
                  styles.opcion,
                  elegida && { backgroundColor: theme.primarioSuave },
                  pressed && !elegida && { backgroundColor: theme.backgroundElement },
                ]}
              >
                <Text style={[styles.textoOpcion, { color: elegida ? theme.primario : theme.text }]}>{item.texto}</Text>
                {elegida && <Text style={[styles.marca, { color: theme.primario }]}>✓</Text>}
              </Pressable>
            );
          }}
        />
      </HojaInferior>
    </>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: Spacing.two - 2,
  },
  campo: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radio,
    borderCurve: "continuous",
  },
  textos: {
    flex: 1,
  },
  etiquetaCompacta: {
    fontSize: 12,
    lineHeight: 15,
  },
  valor: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 15,
  },
  flecha: {
    fontSize: 16,
    lineHeight: 20,
  },
  opcion: {
    height: ALTO_OPCION,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    borderRadius: Radio,
  },
  textoOpcion: {
    fontFamily: Tipografias.destacado,
    fontSize: 16,
  },
  marca: {
    fontFamily: Tipografias.titulo,
    fontSize: 16,
  },
});
