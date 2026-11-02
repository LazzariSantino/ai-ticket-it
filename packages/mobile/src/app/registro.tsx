import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useSesion } from "@/sesion/sesion-context";

export default function RegistroScreen() {
  const { registrarse } = useSesion();
  const [datos, setDatos] = useState({ nombre: "", apellido: "", email: "", contrasenia: "" });
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo: keyof typeof datos) => (valor: string) => setDatos({ ...datos, [campo]: valor });

  async function crearCuenta() {
    setCargando(true);
    setError(null);
    try {
      await registrarse(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta");
      setCargando(false);
    }
  }

  const completo = Object.values(datos).every((valor) => valor.trim() !== "");

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <ThemedText themeColor="textSecondary">
            Con una misma cuenta podés comprar entradas y también publicar tus propios eventos.
          </ThemedText>
          <CampoTexto etiqueta="Nombre" value={datos.nombre} onChangeText={cambiar("nombre")} />
          <CampoTexto etiqueta="Apellido" value={datos.apellido} onChangeText={cambiar("apellido")} />
          <CampoTexto
            etiqueta="Email"
            value={datos.email}
            onChangeText={cambiar("email")}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <CampoTexto
            etiqueta="Contraseña"
            ayuda="Al menos 6 caracteres"
            value={datos.contrasenia}
            onChangeText={cambiar("contrasenia")}
            secureTextEntry
          />
          {error && (
            <ThemedText type="small" themeColor="peligro">
              {error}
            </ThemedText>
          )}
          <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={cargando} deshabilitado={!completo} />
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
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
