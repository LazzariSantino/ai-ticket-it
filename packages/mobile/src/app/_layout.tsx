import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque/700Bold";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { Colors, Tipografias } from "@/constants/theme";
import { SesionProvider, useSesion } from "@/sesion/sesion-context";

// Los colores de la navegación (fondo de las pantallas, headers, tinte) salen del tema de la app
const conColores = (base: typeof DefaultTheme, colores: (typeof Colors)["light" | "dark"]) => ({
  ...base,
  colors: {
    ...base.colors,
    primary: colores.primario,
    background: colores.background,
    card: colores.background,
    text: colores.text,
    border: colores.borde,
  },
});
const TEMA_CLARO = conColores(DefaultTheme, Colors.light);
const TEMA_OSCURO = conColores(DarkTheme, Colors.dark);

function Navegacion() {
  const { usuario } = useSesion();
  const logueado = usuario !== null;

  // Stack.Protected muestra unas pantallas u otras según haya sesión, y redirige solo al cambiar
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerTitleStyle: { fontFamily: Tipografias.subtitulo },
        headerShadowVisible: false,
      }}
    >
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
  const [fuentesListas, errorFuentes] = useFonts({
    [Tipografias.titulo]: BricolageGrotesque_800ExtraBold,
    [Tipografias.subtitulo]: BricolageGrotesque_700Bold,
    [Tipografias.destacado]: BricolageGrotesque_600SemiBold,
  });

  // Si las fuentes fallan se sigue igual con la del sistema; sólo se espera mientras cargan
  if (!fuentesListas && !errorFuentes) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? TEMA_OSCURO : TEMA_CLARO}>
      <SesionProvider>
        <StatusBar style="auto" />
        <Navegacion />
      </SesionProvider>
    </ThemeProvider>
  );
}
