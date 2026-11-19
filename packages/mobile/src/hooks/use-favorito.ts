import { useState } from "react";

import { agregarFavorito, quitarFavorito } from "@/api/eventos";
import { useSesion, useUsuario } from "@/sesion/sesion-context";

// Si un evento está en favoritos y cómo cambiarlo. La lista de favoritos vive en la sesión, así el corazón
// queda igual en Explorar, en el detalle y en el perfil sin volver a pedir los eventos.
export function useFavorito(eventoId: number) {
  const usuario = useUsuario();
  const { actualizarUsuario } = useSesion();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esFavorito = usuario.favoritos.includes(eventoId);

  async function alternar() {
    if (guardando) return;
    setGuardando(true);
    setError(null);
    try {
      actualizarUsuario(esFavorito ? await quitarFavorito(eventoId) : await agregarFavorito(eventoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el favorito");
    } finally {
      setGuardando(false);
    }
  }

  return { esFavorito, alternar, guardando, error };
}
