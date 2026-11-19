import { ScrollView, StyleSheet, View } from "react-native";

import { URL_API } from "@/api/cliente";
import { listarMisCompras } from "@/api/compras";
import { listarFavoritos } from "@/api/eventos";
import { Avatar } from "@/components/avatar";
import { Boton } from "@/components/boton";
import { Cargando, Vacio } from "@/components/estado-pantalla";
import { EventoCard } from "@/components/evento-card";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RadioGrande, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useSesion, useUsuario } from "@/sesion/sesion-context";

export default function PerfilScreen() {
  const usuario = useUsuario();
  const { cerrarSesion } = useSesion();
  const favoritos = useConsulta(listarFavoritos);
  const compras = useConsulta(listarMisCompras);
  const proximas = (compras.datos ?? []).filter((compra) => compra.diasParaEvento !== null).length;

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
          <Indicador valor={proximas} texto={proximas === 1 ? "evento por venir" : "eventos por venir"} />
          <Indicador valor={favoritos.datos?.length ?? 0} texto="favoritos" />
        </View>

        <ThemedText type="subtitle" style={styles.seccion}>
          Mis favoritos
        </ThemedText>
        {favoritos.cargando ? (
          <Cargando />
        ) : favoritos.datos?.length ? (
          favoritos.datos.map((evento) => <EventoCard key={evento.id} evento={evento} />)
        ) : (
          <Vacio emoji="♡" titulo="Todavía no guardaste eventos" detalle="Tocá el ♡ en un evento para tenerlo acá." />
        )}

        <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} style={styles.salir} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.servidor}>
          Servidor: {URL_API}
        </ThemedText>
      </ScrollView>
    </PantallaTab>
  );
}

function Indicador({ valor, texto }: { valor: number; texto: string }) {
  return (
    <ThemedView type="primarioSuave" style={styles.indicador}>
      <ThemedText type="title" themeColor="primario">
        {valor}
      </ThemedText>
      <ThemedText type="small" themeColor="primario">
        {texto}
      </ThemedText>
    </ThemedView>
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
