import { pedir } from "./cliente";
import type { Categoria, Evento, EventoDetalle, OrdenEventos, Usuario } from "./tipos";

export type FiltrosEventos = {
  q?: string;
  categoriaId?: number;
  orden?: OrdenEventos;
  direccion?: "asc" | "desc";
};

function aQueryString(filtros: FiltrosEventos) {
  const parametros = Object.entries(filtros)
    .filter(([, valor]) => valor !== undefined && valor !== "")
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(String(valor))}`);
  return parametros.length ? `?${parametros.join("&")}` : "";
}

export const listarCategorias = () => pedir<Categoria[]>("/categorias");

export const buscarEventos = (filtros: FiltrosEventos) => pedir<Evento[]>(`/eventos${aQueryString(filtros)}`);

export const obtenerEvento = (id: number | string) => pedir<EventoDetalle>(`/eventos/${id}`);

export const listarMisEventos = () => pedir<Evento[]>("/eventos/mios");

export const listarFavoritos = () => pedir<Evento[]>("/eventos/favoritos");

export const agregarFavorito = (id: number) => pedir<Usuario>(`/eventos/${id}/favorito`, { metodo: "PUT" });

export const quitarFavorito = (id: number) => pedir<Usuario>(`/eventos/${id}/favorito`, { metodo: "DELETE" });

export type NuevoEvento = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  fecha: string;
  multimedia: string[];
  tiposEntrada: { nombre: string; descripcion: string; precio: number; cupo: number }[];
};

export const crearEvento = (evento: NuevoEvento) => pedir<Evento>("/eventos", { metodo: "POST", body: evento });
