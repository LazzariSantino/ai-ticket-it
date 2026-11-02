import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { reseniar } from "@/api/compras";
import type { Resenia } from "@/api/tipos";
import { Boton } from "@/components/boton";
import { CampoTexto } from "@/components/campo-texto";
import { Estrellas } from "@/components/estrellas";
import { Tarjeta } from "@/components/tarjeta";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export function FormularioResenia({ compraId, onReseniada }: { compraId: number; onReseniada: (r: Resenia) => void }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      onReseniada(await reseniar(compraId, puntuacion, detalle));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la reseña");
      setEnviando(false);
    }
  }

  return (
    <Tarjeta titulo="¿Qué te pareció el evento?">
      <ThemedText type="small" themeColor="textSecondary">
        Tu reseña ayuda a otros compradores a conocer al organizador.
      </ThemedText>
      <View style={styles.estrellas}>
        <Estrellas puntaje={puntuacion} tamanio={34} onCambiar={setPuntuacion} />
      </View>
      <CampoTexto
        value={detalle}
        onChangeText={setDetalle}
        placeholder="Contá tu experiencia"
        multiline
        style={styles.comentario}
      />
      {error && (
        <ThemedText type="small" themeColor="peligro">
          {error}
        </ThemedText>
      )}
      <Boton
        titulo="Publicar reseña"
        onPress={enviar}
        cargando={enviando}
        deshabilitado={puntuacion === 0 || !detalle.trim()}
      />
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  estrellas: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  comentario: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});
