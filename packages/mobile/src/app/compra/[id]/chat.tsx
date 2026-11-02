import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { enviarMensaje, listarMensajes } from "@/api/compras";
import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useUsuario } from "@/sesion/sesion-context";
import { formatearFechaHora } from "@/utils/formato";

// Cada cuánto se buscan mensajes nuevos mientras el chat está abierto
const INTERVALO_ACTUALIZACION_MS = 5000;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const usuario = useUsuario();
  const theme = useTheme();
  const { datos: mensajes, setDatos, error, cargando, recargar } = useConsulta(() => listarMensajes(id), [id]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const lista = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      const intervalo = setInterval(recargar, INTERVALO_ACTUALIZACION_MS);
      return () => clearInterval(intervalo);
    }, [recargar]),
  );

  async function enviar() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const mensaje = await enviarMensaje(id, texto);
      setDatos([...(mensajes ?? []), mensaje]);
      setTexto("");
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : "No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <Cargando />;
  if (error) return <ErrorPantalla mensaje={error} onReintentar={recargar} />;

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={lista}
          data={mensajes ?? []}
          keyExtractor={(mensaje, indice) => `${mensaje.enviado}-${indice}`}
          contentContainerStyle={styles.lista}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Vacio titulo="Sin mensajes" detalle="Escribí tu consulta sobre el evento, el acceso o cambios de fecha." />
          }
          renderItem={({ item }) => {
            const propio = item.usuario.id === usuario.id;
            return (
              <View
                style={[
                  styles.burbuja,
                  propio
                    ? [styles.propia, { backgroundColor: theme.primario }]
                    : [styles.ajena, { backgroundColor: theme.backgroundElement, borderColor: theme.borde }],
                ]}
              >
                {!propio && (
                  <ThemedText type="smallBold" style={{ color: theme.primario }}>
                    {item.usuario.nombre} {item.usuario.apellido}
                  </ThemedText>
                )}
                <ThemedText style={propio && { color: theme.sobrePrimario }}>{item.mensaje}</ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.hora, { color: propio ? theme.sobrePrimario : theme.textSecondary }]}
                >
                  {formatearFechaHora(item.enviado)}
                </ThemedText>
              </View>
            );
          }}
        />
        <SafeAreaView edges={["bottom"]} style={[styles.redactar, { borderColor: theme.borde }]}>
          {errorEnvio && (
            <ThemedText type="small" themeColor="peligro">
              {errorEnvio}
            </ThemedText>
          )}
          <View style={styles.fila}>
            <View style={styles.flex}>
              <CampoTexto value={texto} onChangeText={setTexto} placeholder="Escribí un mensaje" multiline />
            </View>
            <Boton titulo="Enviar" onPress={enviar} cargando={enviando} deshabilitado={!texto.trim()} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  lista: {
    flexGrow: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  burbuja: {
    maxWidth: "80%",
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radio,
    gap: Spacing.half,
  },
  propia: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  ajena: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  hora: {
    fontSize: 11,
    opacity: 0.8,
    alignSelf: "flex-end",
  },
  redactar: {
    padding: Spacing.two,
    gap: Spacing.one,
    borderTopWidth: 1,
  },
  fila: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
});
