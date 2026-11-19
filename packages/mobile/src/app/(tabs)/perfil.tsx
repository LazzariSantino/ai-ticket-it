import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { URL_API } from "@/api/cliente";
import { listarMisCompras } from "@/api/compras";
import { listarFavoritos } from "@/api/eventos";
import { Avatar } from "@/components/avatar";
import { Boton } from "@/components/boton";
import { CompraCard } from "@/components/compra-card";
import { Cargando, Vacio } from "@/components/estado-pantalla";
import { EventoCard } from "@/components/evento-card";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";
import { useSesion, useUsuario } from "@/sesion/sesion-context";

export default function PerfilScreen() {
  const usuario = useUsuario();
  const { cerrarSesion } = useSesion();
  const favoritos = useConsulta(listarFavoritos);
  const compras = useConsulta(listarMisCompras);
  // Las compras confirmadas de eventos que todavía no pasaron, de la más cercana a la más lejana
  const proximas = (compras.datos ?? [])
    .filter((compra) => compra.diasParaEvento !== null)
    .sort((a, b) => (a.diasParaEvento ?? 0) - (b.diasParaEvento ?? 0));
  const [seccion, setSeccion] = useState<"proximos" | "favoritos">("proximos");

  return (
    <PantallaTab titulo="Perfil" subtitulo="Tu cuenta y tus eventos guardados">
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.contenido}>
        <ThemedView type="backgroundElement" style={styles.tarjeta}>
          <Avatar nombre={usuario.nombre} apellido={usuario.apellido} tamanio={64} />
          <View style={styles.flex}>
            <ThemedText type="subtitle">
              {usuario.nombre} {usuario.apellido}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {usuario.email}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.indicadores}>
          <Indicador
            valor={proximas.length}
            texto={proximas.length === 1 ? "evento por venir" : "eventos por venir"}
            elegido={seccion === "proximos"}
            onPress={() => setSeccion("proximos")}
          />
          <Indicador
            valor={favoritos.datos?.length ?? 0}
            texto="favoritos"
            elegido={seccion === "favoritos"}
            onPress={() => setSeccion("favoritos")}
          />
        </View>

        {seccion === "proximos" ? (
          <>
            <ThemedText type="subtitle" style={styles.seccion}>
              Mis próximos eventos
            </ThemedText>
            {compras.cargando ? (
              <Cargando />
            ) : proximas.length ? (
              proximas.map((compra) => <CompraCard key={compra.id} compra={compra} />)
            ) : (
              <Vacio
                emoji="🎟️"
                titulo="No tenés eventos por venir"
                detalle="Cuando pagues una entrada, el evento va a aparecer acá."
              />
            )}
          </>
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.seccion}>
              Mis favoritos
            </ThemedText>
            {favoritos.cargando ? (
              <Cargando />
            ) : favoritos.datos?.length ? (
              favoritos.datos.map((evento) => <EventoCard key={evento.id} evento={evento} />)
            ) : (
              <Vacio
                emoji="♡"
                titulo="Todavía no guardaste eventos"
                detalle="Tocá el ♡ en un evento para tenerlo acá."
              />
            )}
          </>
        )}

        <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} style={styles.salir} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.servidor}>
          Servidor: {URL_API}
        </ThemedText>
      </ScrollView>
    </PantallaTab>
  );
}

// Recuadro con un número que funciona como pestaña: el elegido se pinta lleno y elige qué lista se ve abajo
function Indicador({
  valor,
  texto,
  elegido,
  onPress,
}: {
  valor: number;
  texto: string;
  elegido: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = elegido ? "sobrePrimario" : "primario";
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: elegido }}
      accessibilityLabel={`${valor} ${texto}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.indicador,
        { backgroundColor: elegido ? theme.primario : theme.primarioSuave, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <ThemedText type="title" themeColor={color}>
        {valor}
      </ThemedText>
      <ThemedText type="small" themeColor={color}>
        {texto}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenido: {
    paddingHorizontal: Spacing.four - 4,
    paddingBottom: Spacing.five,
    gap: Spacing.three - 4,
  },
  flex: {
    flex: 1,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.four - 4,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  indicadores: {
    flexDirection: "row",
    gap: Spacing.three - 4,
  },
  indicador: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
  },
  seccion: {
    marginTop: Spacing.three,
  },
  salir: {
    marginTop: Spacing.three,
  },
  servidor: {
    textAlign: "center",
  },
});
