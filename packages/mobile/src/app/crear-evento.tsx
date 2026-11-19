import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { crearEvento, listarCategorias } from "@/api/eventos";
import { subirImagen } from "@/api/imagenes";
import { Boton } from "@/components/boton";
import { Calendario } from "@/components/calendario";
import { CampoTexto } from "@/components/campo-texto";
import { CampoSeleccion, Desplegable, type Opcion } from "@/components/desplegable";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing, Tipografias } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";

type TipoEnFormulario = { nombre: string; descripcion: string; precio: string; cupo: string };

const TIPO_VACIO: TipoEnFormulario = { nombre: "", descripcion: "", precio: "", cupo: "" };

// Una foto elegida de la galería, todavía sin subir: `uri` sirve para mostrarla y `base64` para mandarla
type FotoElegida = { uri: string; base64: string; tipo: string };
const MAXIMO_FOTOS = 4;
const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Horarios cada media hora, de 00:00 a 23:30
const HORARIOS: Opcion<string>[] = Array.from({ length: 48 }, (_, i) => {
  const hora = `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`;
  return { valor: hora, texto: `${hora} h` };
});

export default function CrearEventoScreen() {
  const theme = useTheme();
  const categorias = useConsulta(listarCategorias);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [dia, setDia] = useState<Date | null>(null);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [hora, setHora] = useState("21:00");
  const [fotos, setFotos] = useState<FotoElegida[]>([]);
  const [tipos, setTipos] = useState<TipoEnFormulario[]>([
    { ...TIPO_VACIO, nombre: "General" },
    { ...TIPO_VACIO, nombre: "VIP" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiarTipo = (indice: number, campo: keyof TipoEnFormulario, valor: string) =>
    setTipos(tipos.map((tipo, i) => (i === indice ? { ...tipo, [campo]: valor } : tipo)));

  // El día y la hora elegidos, en la hora local del celular
  const fechaElegida = () => {
    if (!dia) return null;
    const [horas, minutos] = hora.split(":").map(Number);
    return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), horas, minutos);
  };

  // Validaciones de formato en la app; las reglas del negocio (nombres repetidos, cupos) las valida el backend
  function validarFormulario() {
    if (!nombre.trim() || !descripcion.trim()) return "Completá el nombre y la descripción";
    if (categoriaId === null) return "Elegí una categoría";
    const fecha = fechaElegida();
    if (!fecha) return "Elegí el día del evento";
    if (fecha <= new Date()) return "El evento tiene que ser en el futuro: elegí otro horario";
    if (tipos.some((tipo) => !tipo.nombre.trim() || !tipo.precio || !tipo.cupo)) {
      return "Cada tipo de entrada necesita nombre, precio y cupo";
    }
    return null;
  }

  // Abre la galería (o el selector de archivos en la web). Con calidad < 1 el celular la convierte a JPEG.
  async function elegirFotos() {
    setError(null);
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAXIMO_FOTOS - fotos.length,
      quality: 0.6,
      base64: true,
    });
    if (resultado.canceled) return;
    const nuevas = resultado.assets.flatMap((asset) => {
      // En la web la foto llega como data URL y el base64 está después de la coma
      const base64 = asset.base64 ?? (asset.uri.startsWith("data:") ? asset.uri.split(",")[1] : null);
      if (!base64) return [];
      const tipo = asset.mimeType && TIPOS_ACEPTADOS.includes(asset.mimeType) ? asset.mimeType : "image/jpeg";
      return [{ uri: asset.uri, base64, tipo }];
    });
    setFotos([...fotos, ...nuevas].slice(0, MAXIMO_FOTOS));
  }

  async function guardar() {
    const errorFormulario = validarFormulario();
    if (errorFormulario) {
      setError(errorFormulario);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      // Primero se suben las fotos y el evento se crea con las rutas que devuelve el servidor
      const multimedia: string[] = [];
      for (const foto of fotos) {
        multimedia.push((await subirImagen(foto.base64, foto.tipo)).url);
      }
      const evento = await crearEvento({
        nombre,
        descripcion,
        categoriaId: categoriaId!,
        fecha: fechaElegida()!.toISOString(),
        multimedia,
        tiposEntrada: tipos.map((tipo) => ({
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          precio: Number(tipo.precio),
          cupo: Number(tipo.cupo),
        })),
      });
      router.replace(`/evento/${evento.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el evento");
      setGuardando(false);
    }
  }

  const textoDia = dia?.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <Tarjeta titulo="El evento">
            <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej.: Noche de jazz" />
            <CampoTexto
              etiqueta="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Contá de qué se trata el evento"
              multiline
              style={styles.multilinea}
            />
            <Desplegable
              etiqueta="Categoría"
              titulo="Elegí la categoría"
              placeholder="Elegí una categoría"
              valor={categoriaId}
              opciones={(categorias.datos ?? []).map((categoria) => ({ valor: categoria.id, texto: categoria.nombre }))}
              onCambiar={setCategoriaId}
            />
          </Tarjeta>

          <Tarjeta titulo="Cuándo">
            <CampoSeleccion
              etiqueta="Día"
              texto={textoDia && textoDia.charAt(0).toUpperCase() + textoDia.slice(1)}
              placeholder="Elegí el día en el calendario"
              onPress={() => setCalendarioAbierto(true)}
            />
            <Desplegable
              etiqueta="Hora de inicio"
              titulo="Elegí la hora"
              valor={hora}
              opciones={HORARIOS}
              onCambiar={setHora}
            />
          </Tarjeta>

          <Tarjeta titulo="Fotos (opcional)">
            <ThemedText type="small" themeColor="textSecondary">
              Elegí hasta {MAXIMO_FOTOS} fotos de tu galería. La primera es la portada del evento.
            </ThemedText>
            {fotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fotos}>
                {fotos.map((foto, indice) => (
                  <View key={foto.uri} style={styles.miniatura}>
                    <Image
                      source={foto.uri}
                      style={[styles.imagenMiniatura, { backgroundColor: theme.primarioSuave }]}
                      contentFit="cover"
                      accessibilityLabel={`Foto ${indice + 1}`}
                    />
                    {indice === 0 && (
                      <View style={[styles.portada, { backgroundColor: theme.primario }]}>
                        <Text style={[styles.portadaTexto, { color: theme.sobrePrimario }]}>Portada</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => setFotos(fotos.filter((_, i) => i !== indice))}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar la foto ${indice + 1}`}
                      style={[styles.quitar, { backgroundColor: theme.velo }]}
                    >
                      <Text style={styles.quitarTexto}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
            {fotos.length < MAXIMO_FOTOS && (
              <Boton
                titulo={fotos.length === 0 ? "Elegir fotos de la galería" : "+ Agregar más fotos"}
                variante="secundario"
                onPress={elegirFotos}
              />
            )}
          </Tarjeta>

          <ThemedText type="subtitle" style={styles.seccion}>
            Tipos de entrada
          </ThemedText>
          {tipos.map((tipo, indice) => (
            <Tarjeta key={indice}>
              <View style={styles.encabezadoTipo}>
                <ThemedText type="smallBold">Entrada {indice + 1}</ThemedText>
                {tipos.length > 1 && (
                  <Pressable
                    onPress={() => setTipos(tipos.filter((_, i) => i !== indice))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar la entrada ${indice + 1}`}
                  >
                    <ThemedText type="smallBold" themeColor="peligro">
                      Quitar
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              <CampoTexto
                placeholder="Nombre (Platea, VIP…)"
                value={tipo.nombre}
                onChangeText={(valor) => cambiarTipo(indice, "nombre", valor)}
              />
              <CampoTexto
                placeholder="Descripción (opcional)"
                value={tipo.descripcion}
                onChangeText={(valor) => cambiarTipo(indice, "descripcion", valor)}
              />
              <View style={styles.fila}>
                <View style={styles.flex}>
                  <CampoTexto
                    placeholder="Precio $ (0 = gratis)"
                    keyboardType="numeric"
                    value={tipo.precio}
                    onChangeText={(valor) => cambiarTipo(indice, "precio", valor.replace(/[^0-9.]/g, ""))}
                  />
                </View>
                <View style={styles.flex}>
                  <CampoTexto
                    placeholder="Cupo"
                    keyboardType="number-pad"
                    value={tipo.cupo}
                    onChangeText={(valor) => cambiarTipo(indice, "cupo", valor.replace(/[^0-9]/g, ""))}
                  />
                </View>
              </View>
            </Tarjeta>
          ))}
          <Boton
            titulo="+ Agregar tipo de entrada"
            variante="secundario"
            onPress={() => setTipos([...tipos, { ...TIPO_VACIO }])}
          />

          {error && (
            <ThemedText type="smallBold" themeColor="peligro" style={styles.error}>
              {error}
            </ThemedText>
          )}
          <Boton titulo="Publicar evento" onPress={guardar} cargando={guardando} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Calendario
        visible={calendarioAbierto}
        valor={dia}
        minimo={new Date()}
        onElegir={setDia}
        onCerrar={() => setCalendarioAbierto(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenido: {
    padding: Spacing.four - 4,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  multilinea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  fotos: {
    gap: Spacing.two + 2,
  },
  miniatura: {
    width: 120,
    height: 96,
  },
  imagenMiniatura: {
    width: "100%",
    height: "100%",
    borderRadius: Radio,
  },
  portada: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  portadaTexto: {
    fontFamily: Tipografias.subtitulo,
    fontSize: 11,
  },
  quitar: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  quitarTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Tipografias.titulo,
  },
  seccion: {
    marginTop: Spacing.two,
  },
  fila: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  encabezadoTipo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  error: {
    textAlign: "center",
  },
});
