import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { SesionProvider, useSesion } from "@/sesion/sesion-context";

function Navegacion() {
  const { usuario } = useSesion();
  const logueado = usuario !== null;

  // Stack.Protected muestra unas pantallas u otras según haya sesión, y redirige solo al cambiar
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Protected guard={logueado}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Inicio" }} />
        <Stack.Screen name="evento/[id]/index" options={{ title: "" }} />
        <Stack.Screen name="compra/[id]/index" options={{ title: "Compra" }} />
        <Stack.Screen name="compra/[id]/chat" options={{ title: "Chat de la compra" }} />
        <Stack.Screen name="crear-evento" options={{ title: "Nuevo evento", presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={!logueado}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: "Crear cuenta" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SesionProvider>
        <StatusBar style="auto" />
        <Navegacion />
      </SesionProvider>
    </ThemeProvider>
  );
}
