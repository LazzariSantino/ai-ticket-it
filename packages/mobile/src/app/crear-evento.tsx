import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { crearEvento, listarCategorias } from "@/api/eventos";
import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { Chip } from "@/components/chip";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useConsulta } from "@/hooks/use-consulta";

type TipoEnFormulario = { nombre: string; descripcion: string; precio: string; cupo: string };

const TIPO_VACIO: TipoEnFormulario = { nombre: "", descripcion: "", precio: "", cupo: "" };

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^\d{2}:\d{2}$/;

export default function CrearEventoScreen() {
  const categorias = useConsulta(listarCategorias);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
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

  // Validaciones de formato en la app; las reglas del negocio (fecha futura, nombres repetidos, cupos) las valida el backend
  function validarFormulario() {
    if (!nombre.trim() || !descripcion.trim()) return "Completá el nombre y la descripción";
    if (categoriaId === null) return "Elegí una categoría";
    if (!FORMATO_FECHA.test(fecha) || !FORMATO_HORA.test(hora))
      return "La fecha va como AAAA-MM-DD y la hora como HH:MM";
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
        // Se arma con la hora local del celular y se envía en ISO (UTC)
        fecha: new Date(`${fecha}T${hora}:00`).toISOString(),
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

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Noche de Jazz" />
          <CampoTexto
            etiqueta="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Contá de qué se trata el evento"
            multiline
            style={styles.multilinea}
          />

          <View style={styles.grupo}>
            <ThemedText type="smallBold">Categoría</ThemedText>
            <View style={styles.chips}>
              {categorias.datos?.map((categoria) => (
                <Chip
                  key={categoria.id}
                  texto={categoria.nombre}
                  activo={categoriaId === categoria.id}
                  onPress={() => setCategoriaId(categoria.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fila}>
            <View style={styles.flex}>
              <CampoTexto etiqueta="Fecha" value={fecha} onChangeText={setFecha} placeholder="2026-12-31" />
            </View>
            <View style={styles.flex}>
              <CampoTexto etiqueta="Hora" value={hora} onChangeText={setHora} placeholder="21:00" />
            </View>
          </View>

          <CampoTexto
            etiqueta="Imagen (opcional)"
            ayuda="URL de una imagen del evento"
            value={imagen}
            onChangeText={setImagen}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://..."
          />

          <ThemedText type="subtitle">Tipos de entrada</ThemedText>
          {tipos.map((tipo, indice) => (
            <Tarjeta key={indice}>
              <View style={styles.encabezadoTipo}>
                <ThemedText type="smallBold">Entrada {indice + 1}</ThemedText>
                {tipos.length > 1 && (
                  <Pressable onPress={() => setTipos(tipos.filter((_, i) => i !== indice))} hitSlop={8}>
                    <ThemedText type="small" themeColor="peligro">
                      Quitar
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              <CampoTexto
                placeholder="Nombre (Platea, VIP...)"
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
                    placeholder="Precio $"
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
            <ThemedText type="small" themeColor="peligro">
              {error}
            </ThemedText>
          )}
          <Boton titulo="Publicar evento" onPress={guardar} cargando={guardando} />
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
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  multilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  grupo: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  fila: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  encabezadoTipo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
