import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { crearEvento, listarCategorias } from "@/api/eventos";
import { Boton } from "@/components/boton";
import { Calendario } from "@/components/calendario";
import { CampoTexto } from "@/components/campo-texto";
import { CampoSeleccion, Desplegable, type Opcion } from "@/components/desplegable";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radio, Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";
import { useTheme } from "@/hooks/use-theme";

type TipoEnFormulario = { nombre: string; descripcion: string; precio: string; cupo: string };

const TIPO_VACIO: TipoEnFormulario = { nombre: "", descripcion: "", precio: "", cupo: "" };

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
  const [imagen, setImagen] = useState("");
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

  async function guardar() {
    const errorFormulario = validarFormulario();
    if (errorFormulario) {
      setError(errorFormulario);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const evento = await crearEvento({
        nombre,
        descripcion,
        categoriaId: categoriaId!,
        fecha: fechaElegida()!.toISOString(),
        multimedia: imagen.trim() ? [imagen.trim()] : [],
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

          <Tarjeta titulo="Imagen (opcional)">
            <CampoTexto
              ayuda="Pegá la dirección de una foto del evento"
              value={imagen}
              onChangeText={setImagen}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://..."
            />
            {imagen.trim().startsWith("http") && (
              <Image
                source={imagen.trim()}
                style={[styles.vistaPrevia, { backgroundColor: theme.primarioSuave }]}
                contentFit="cover"
                accessibilityLabel="Vista previa de la imagen"
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
  vistaPrevia: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: Radio,
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
