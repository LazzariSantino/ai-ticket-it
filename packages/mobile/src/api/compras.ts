import { pedir } from "./cliente";
import type { Compra, ComprasDeEvento, EstadoCompra, Mensaje, Resenia } from "./tipos";

export const comprar = (eventoId: number, tipoEntradaId: number, cantidad: number) =>
  pedir<Compra>("/compras", { metodo: "POST", body: { eventoId, tipoEntradaId, cantidad } });

export const listarMisCompras = () => pedir<Compra[]>("/compras");

export const obtenerCompra = (id: number | string) => pedir<Compra>(`/compras/${id}`);

export const listarComprasDeEvento = (eventoId: number | string, estado?: EstadoCompra) =>
  pedir<ComprasDeEvento>(`/eventos/${eventoId}/compras${estado ? `?estado=${estado}` : ""}`);

export const pagar = (id: number) => pedir<Compra>(`/compras/${id}/pago`, { metodo: "POST" });

export const cancelar = (id: number) => pedir<Compra>(`/compras/${id}/cancelacion`, { metodo: "POST" });

export const marcarUtilizada = (id: number) => pedir<Compra>(`/compras/${id}/uso`, { metodo: "POST" });

// Con `desde` (la cantidad de mensajes que ya se tienen) el backend devuelve sólo los nuevos
export const listarMensajes = (id: number | string, desde = 0) =>
  pedir<Mensaje[]>(`/compras/${id}/mensajes${desde > 0 ? `?desde=${desde}` : ""}`);

export const enviarMensaje = (id: number | string, mensaje: string) =>
  pedir<Mensaje>(`/compras/${id}/mensajes`, { metodo: "POST", body: { mensaje } });

export const reseniar = (id: number, puntuacion: number, detalle: string) =>
  pedir<Resenia>(`/compras/${id}/resenia`, { metodo: "POST", body: { puntuacion, detalle } });
