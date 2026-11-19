import { ScrollView, StyleSheet, Text, View } from "react-native";

import { URL_API } from "@/api/cliente";
import { listarFavoritos } from "@/api/eventos";
import { Boton } from "@/components/boton";
import { Cargando } from "@/components/estado-pantalla";
import { EventoCard } from "@/components/evento-card";
import { PantallaTab } from "@/components/pantalla-tab";
import { ThemedText } from "@/components/themed-text";
import { Marquesina, RadioGrande, Spacing, Tipografias } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useSesion, useUsuario } from "@/sesion/sesion-context";

export default function PerfilScreen() {
  const usuario = useUsuario();
  const { cerrarSesion } = useSesion();
  const favoritos = useConsulta(listarFavoritos);

  return (
    <PantallaTab antetitulo="Tu cuenta" titulo="Perfil">
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.contenido}>
        {/* El usuario se muestra como un pase de la boletería, con la marquesina de la marca */}
        <View style={styles.pase}>
          <View style={styles.paseArriba}>
            <Text style={styles.paseEtiqueta}>AI Ticket It · Pase</Text>
            <Text style={styles.paseEmoji}>🎟️</Text>
          </View>
          <View style={styles.paseUsuario}>
            <View style={styles.avatar}>
              <Text style={styles.iniciales}>
                {usuario.nombre[0]}
                {usuario.apellido[0]}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.nombre}>
                {usuario.nombre} {usuario.apellido}
              </Text>
              <Text style={styles.email}>{usuario.email}</Text>
            </View>
          </View>
        </View>

        <ThemedText type="etiqueta" themeColor="textSecondary" style={styles.seccion}>
          Mis favoritos
        </ThemedText>
        {favoritos.cargando ? (
          <Cargando />
        ) : favoritos.datos?.length ? (
          favoritos.datos.map((evento) => <EventoCard key={evento.id} evento={evento} />)
        ) : (
          <ThemedText themeColor="textSecondary">Tocá el ♡ en un evento para guardarlo acá.</ThemedText>
        )}

        <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} />

        <ThemedText type="small" themeColor="textSecondary" style={styles.servidor}>
          Servidor: {URL_API}
        </ThemedText>
      </ScrollView>
    </PantallaTab>
  );
}

const styles = StyleSheet.create({
  contenido: {
    paddingHorizontal: Spacing.three + 4,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  pase: {
    padding: Spacing.four - 4,
    borderRadius: RadioGrande,
    borderCurve: "continuous",
    gap: Spacing.four,
    backgroundImage: Marquesina,
    boxShadow: "0px 14px 30px rgba(91, 46, 255, 0.3)",
  },
  paseArriba: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paseEtiqueta: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  paseEmoji: {
    fontSize: 22,
  },
  paseUsuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  iniciales: {
    color: "#FFFFFF",
    fontFamily: Tipografias.subtitulo,
    fontSize: 20,
  },
  nombre: {
    color: "#FFFFFF",
    fontFamily: Tipografias.titulo,
    fontSize: 24,
    lineHeight: 28,
  },
  email: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
  },
  seccion: {
    marginTop: Spacing.two,
  },
  servidor: {
    textAlign: "center",
  },
});
