import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSesion } from "@/sesion/sesion-context";

export default function LoginScreen() {
  const { iniciarSesion } = useSesion();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function ingresar() {
    setCargando(true);
    setError(null);
    try {
      await iniciarSesion(email, contrasenia);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
      setCargando(false);
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <View style={styles.encabezado}>
              <ThemedText style={[styles.logo, { color: theme.primario }]}>🎟️</ThemedText>
              <ThemedText type="title">AI Ticket It</ThemedText>
              <ThemedText themeColor="textSecondary">Descubrí eventos y comprá tus entradas</ThemedText>
            </View>

            <CampoTexto
              etiqueta="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="tu@email.com"
            />
            <CampoTexto
              etiqueta="Contraseña"
              value={contrasenia}
              onChangeText={setContrasenia}
              secureTextEntry
              placeholder="••••••"
              onSubmitEditing={ingresar}
            />

            {error && (
              <ThemedText type="small" themeColor="peligro">
                {error}
              </ThemedText>
            )}

            <Boton titulo="Ingresar" onPress={ingresar} cargando={cargando} deshabilitado={!email || !contrasenia} />

            <Link href="/registro" style={styles.centrado}>
              <ThemedText type="link">¿No tenés cuenta? Registrate</ThemedText>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  encabezado: {
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  logo: {
    fontSize: 56,
    lineHeight: 68,
  },
  centrado: {
    alignSelf: "center",
  },
});
