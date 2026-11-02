// Formas de los datos que devuelve la API del backend (ver /api-docs)

export type EstadoCompra = "PENDIENTE" | "CONFIRMADA" | "UTILIZADA" | "CANCELADA" | "REEMBOLSADA";

export const ESTADOS_COMPRA: EstadoCompra[] = ["PENDIENTE", "CONFIRMADA", "UTILIZADA", "CANCELADA", "REEMBOLSADA"];

export type UsuarioResumen = { id: number; nombre: string; apellido: string };

export type Usuario = UsuarioResumen & { email: string; favoritos: number[] };

export type Sesion = { token: string; usuario: Usuario };

export type Categoria = { id: number; nombre: string; descripcion: string };

export type TipoEntrada = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cupoTotal: number;
  cupoDisponible: number;
  vendidas: number;
};

export type Organizador = UsuarioResumen & { puntaje: number | null; cantidadResenias: number };

export type Evento = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  fecha: string;
  multimedia: string[];
  organizador: Organizador;
  tiposEntrada: TipoEntrada[];
  precioMinimo: number;
  entradasDisponibles: number;
};

export type Resenia = {
  id: number;
  comprador: UsuarioResumen;
  evento: { id: number; nombre: string; fecha: string };
  detalle: string;
  puntuacion: number;
  fecha: string;
};

export type EventoDetalle = Evento & {
  esFavorito: boolean;
  esOrganizador: boolean;
  reseniasDelOrganizador: Resenia[];
};

export type CambioEstadoCompra = { estado: EstadoCompra; quien: UsuarioResumen; fechaHora: string };

export type Compra = {
  id: number;
  comprador: UsuarioResumen;
  evento: { id: number; nombre: string; fecha: string; multimedia: string[]; organizador: UsuarioResumen };
  tipoEntrada: { id: number; nombre: string; precio: number };
  cantidad: number;
  total: number;
  fecha: string;
  estado: EstadoCompra;
  diasParaEvento: number | null;
  puedeCancelarse: boolean;
  puedeSerReseniada: boolean;
  cantidadMensajes: number;
  resenia: Resenia | null;
  historial: CambioEstadoCompra[];
};

export type ComprasDeEvento = {
  evento: { id: number; nombre: string; fecha: string };
  tiposEntrada: TipoEntrada[];
  cantidadPorEstado: Record<EstadoCompra, number>;
  compras: Compra[];
};

export type Mensaje = { usuario: UsuarioResumen; mensaje: string; enviado: string };

export type OrdenEventos = "fecha" | "precio" | "puntaje";
