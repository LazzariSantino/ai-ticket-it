import { Image } from "expo-image";
import { Link } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { listarChats } from "@/api/compras";
import type { Compra } from "@/api/tipos";
import { Cargando, ErrorPantalla, Vacio } from "@/components/estado-pantalla";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Radio, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useUsuario } from "@/sesion/sesion-context";
import { formatearFechaHora } from "@/utils/formato";

// Todos los chats en un solo lugar: los de mis compras y los de las compras de mis eventos
export default function MensajesScreen() {
  const theme = useTheme();
  const { datos, error, cargando, recargando, recargar } = useConsulta(listarChats);

  return (
    <PantallaTab titulo="Mensajes">
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={datos ?? []}
        keyExtractor={(compra) => String(compra.id)}
        renderItem={({ item }) => <Conversacion compra={item} />}
        ListEmptyComponent={
          cargando ? (
            <Cargando />
          ) : error ? (
            <ErrorPantalla mensaje={error} onReintentar={recargar} />
          ) : (
            <Vacio
              titulo="No tenés mensajes"
              detalle="Escribile al organizador desde el detalle de una compra y la conversación va a aparecer acá."
            />
          )
        }
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={recargar} tintColor={theme.primario} />}
      />
    </PantallaTab>
  );
}

function Conversacion({ compra }: { compra: Compra }) {
  const theme = useTheme();
  const usuario = useUsuario();
  const soyComprador = compra.comprador.id === usuario.id;
  const otro = soyComprador ? compra.evento.organizador : compra.comprador;
  const ultimo = compra.ultimoMensaje;
  const autor = ultimo?.usuario.id === usuario.id ? "Vos" : ultimo?.usuario.nombre;

  return (
    <Link href={`/compra/${compra.id}/chat`} asChild>
      <Pressable
        accessibilityLabel={`Chat con ${otro.nombre} ${otro.apellido} sobre ${compra.evento.nombre}`}
        style={({ pressed }) => [
          styles.fila,
          { backgroundColor: theme.backgroundElement, borderColor: theme.borde, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Image
          source={compra.evento.multimedia[0]}
          style={[styles.imagen, { backgroundColor: theme.primarioSuave }]}
          contentFit="cover"
        />
        <View style={styles.cuerpo}>
          <View style={styles.encabezado}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.flex}>
              {otro.nombre} {otro.apellido}
            </ThemedText>
            {ultimo && (
              <ThemedText type="small" themeColor="textSecondary">
                {formatearFechaHora(ultimo.enviado)}
              </ThemedText>
            )}
          </View>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {soyComprador ? "Organizador" : "Comprador"} · {compra.evento.nombre}
          </ThemedText>
          {ultimo && (
            <ThemedText type="small" numberOfLines={2}>
              {autor}: {ultimo.mensaje}
            </ThemedText>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  lista: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radio,
    borderWidth: 1,
  },
  imagen: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cuerpo: {
    flex: 1,
    gap: Spacing.half,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
