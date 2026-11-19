import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Marquesina, Spacing, Tipografias } from "@/constants/theme";
import { useSesion } from "@/sesion/sesion-context";

export default function LoginScreen() {
  const { iniciarSesion } = useSesion();
  const insets = useSafeAreaInsets();
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + Spacing.four }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* La marquesina de la boletería, con la marca */}
          <View style={[styles.marquesina, { paddingTop: insets.top + Spacing.five }]}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>🎟️</Text>
            </View>
            <Text style={styles.marca}>AI Ticket It</Text>
            <Text style={styles.lema}>Recitales, teatro, festivales y charlas.{"\n"}Tu próximo plan está acá.</Text>
          </View>

          <View style={styles.formulario}>
            <ThemedText type="subtitle">Entrá a tu cuenta</ThemedText>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
  },
  marquesina: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five + 8,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundImage: Marquesina,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginBottom: Spacing.two,
  },
  logoEmoji: {
    fontSize: 38,
    lineHeight: 46,
  },
  marca: {
    color: "#FFFFFF",
    fontFamily: Tipografias.titulo,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  lema: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
  formulario: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  centrado: {
    alignSelf: "center",
  },
});
