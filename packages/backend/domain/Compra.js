import { ForbiddenError } from "../errors/ForbiddenError.js";
import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";
import { EstadoCompra, puedePasarDe } from "./EstadoCompra.js";
import { Mensaje } from "./Mensaje.js";
import { Resenia } from "./Resenia.js";

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioDelDia(fecha) {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export class Compra {
  constructor({ comprador, evento, tipoEntrada, cantidad, fecha = new Date() }) {
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
    this.fecha = fecha;
    this.estado = EstadoCompra.PENDIENTE;
    this.mensajes = [];
    this.resenia = null;
    this.historial = [
      new CambioEstadoCompra({ compra: this, estado: this.estado, quien: comprador, fechaHora: fecha }),
    ];
  }

  // Valida las reglas de la compra y reserva el cupo. La compra queda pendiente de pago.
  static realizar({ comprador, evento, tipoEntradaId, cantidad, ahora = new Date() }) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new UnprocessableEntityError("La cantidad de entradas debe ser un número entero mayor a 0");
    }
    if (evento.yaSeRealizo(ahora)) {
      throw new UnprocessableEntityError("No se pueden comprar entradas para un evento que ya se realizó");
    }
    if (evento.esOrganizadoPor(comprador)) {
      throw new UnprocessableEntityError("No podés comprar entradas de un evento que organizás");
    }
    const tipoEntrada = evento.buscarTipoEntrada(tipoEntradaId);
    if (!tipoEntrada) {
      throw new UnprocessableEntityError(`El evento no tiene un tipo de entrada con id ${tipoEntradaId}`);
    }

    tipoEntrada.reservar(cantidad);
    return new Compra({ comprador, evento, tipoEntrada, cantidad, fecha: ahora });
  }

  actualizarEstado(estadoNuevo, quien, fechaHora = new Date()) {
    if (!puedePasarDe(this.estado, estadoNuevo)) {
      throw new UnprocessableEntityError(`Una compra ${this.estado} no puede pasar a ${estadoNuevo}`);
    }
    this.estado = estadoNuevo;
    this.historial.push(new CambioEstadoCompra({ compra: this, estado: estadoNuevo, quien, fechaHora }));
  }

  esComprador(usuario) {
    return this.comprador.id === usuario.id;
  }

  participa(usuario) {
    return this.esComprador(usuario) || this.evento.esOrganizadoPor(usuario);
  }

  // El pago es simulado: el comprador lo confirma desde la app
  pagar(quien, ahora = new Date()) {
    if (!this.esComprador(quien)) {
      throw new ForbiddenError("Sólo quien hizo la compra puede pagarla");
    }
    if (this.evento.yaSeRealizo(ahora)) {
      throw new UnprocessableEntityError("No se puede pagar una compra de un evento que ya se realizó");
    }
    this.actualizarEstado(EstadoCompra.CONFIRMADA, quien, ahora);
  }

  // Se puede cancelar mientras no esté utilizada (ni ya cancelada) y el evento no se haya realizado
  puedeCancelarse(ahora = new Date()) {
    return [EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA].includes(this.estado) && !this.evento.yaSeRealizo(ahora);
  }

  // Al cancelar se libera el cupo; si ya estaba pagada, además se reembolsa
  cancelar(quien, ahora = new Date()) {
    if (!this.esComprador(quien)) {
      throw new ForbiddenError("Sólo quien hizo la compra puede cancelarla");
    }
    if (this.evento.yaSeRealizo(ahora)) {
      throw new UnprocessableEntityError("No se puede cancelar una compra de un evento que ya se realizó");
    }
    if (!this.puedeCancelarse(ahora)) {
      throw new UnprocessableEntityError(`No se puede cancelar una compra ${this.estado}`);
    }

    const estabaPagada = this.estado === EstadoCompra.CONFIRMADA;
    this.actualizarEstado(EstadoCompra.CANCELADA, quien, ahora);
    this.tipoEntrada.liberar(this.cantidad);
    if (estabaPagada) {
      this.actualizarEstado(EstadoCompra.REEMBOLSADA, quien, ahora);
    }
  }

  // El organizador valida las entradas en el acceso, a partir del día del evento
  marcarUtilizada(quien, ahora = new Date()) {
    if (!this.evento.esOrganizadoPor(quien)) {
      throw new ForbiddenError("Sólo el organizador del evento puede marcar la compra como utilizada");
    }
    if (ahora < inicioDelDia(this.evento.fecha)) {
      throw new UnprocessableEntityError("Las entradas sólo se pueden utilizar a partir del día del evento");
    }
    this.actualizarEstado(EstadoCompra.UTILIZADA, quien, ahora);
  }

  // Días de calendario que faltan para el evento. Sólo tiene sentido para compras confirmadas
  // de eventos que todavía no se realizaron (0 = es hoy, más tarde).
  diasParaEvento(ahora = new Date()) {
    if (this.estado !== EstadoCompra.CONFIRMADA || this.evento.yaSeRealizo(ahora)) {
      return null;
    }
    return Math.round((inicioDelDia(this.evento.fecha) - inicioDelDia(ahora)) / MILISEGUNDOS_POR_DIA);
  }

  enviarMensaje(usuario, texto, ahora = new Date()) {
    if (!this.participa(usuario)) {
      throw new ForbiddenError("Sólo el comprador y el organizador pueden escribir en el chat de la compra");
    }
    const mensaje = new Mensaje({ usuario, mensaje: texto, enviado: ahora });
    this.mensajes.push(mensaje);
    return mensaje;
  }

  puedeSerReseniada() {
    return this.estado === EstadoCompra.UTILIZADA && !this.resenia;
  }

  // Una vez utilizada la entrada, quien compró puede puntuar el evento una única vez
  reseniar(quien, { detalle, puntuacion }, ahora = new Date()) {
    if (!this.esComprador(quien)) {
      throw new ForbiddenError("Sólo quien hizo la compra puede reseñar el evento");
    }
    if (this.estado !== EstadoCompra.UTILIZADA) {
      throw new UnprocessableEntityError("Sólo se puede reseñar el evento una vez utilizada la entrada");
    }
    if (this.resenia) {
      throw new UnprocessableEntityError("Esta compra ya tiene una reseña");
    }
    this.resenia = new Resenia({ comprador: quien, evento: this.evento, detalle, puntuacion, fecha: ahora });
    return this.resenia;
  }

  // Lo que ve la app de una compra. Recibe el momento actual del reloj de la aplicación (no usa new Date())
  // para que los días que faltan y si se puede cancelar coincidan con las reglas del dominio y con los tests.
  aJSON(ahora) {
    return {
      id: this.id,
      comprador: this.comprador.resumen(),
      evento: {
        id: this.evento.id,
        nombre: this.evento.nombre,
        fecha: this.evento.fecha,
        multimedia: this.evento.multimedia,
        organizador: this.evento.organizador.resumen(),
      },
      tipoEntrada: { id: this.tipoEntrada.id, nombre: this.tipoEntrada.nombre, precio: this.tipoEntrada.precio },
      cantidad: this.cantidad,
      total: this.total,
      fecha: this.fecha,
      estado: this.estado,
      diasParaEvento: this.diasParaEvento(ahora),
      puedeCancelarse: this.puedeCancelarse(ahora),
      cantidadMensajes: this.mensajes.length,
      puedeSerReseniada: this.puedeSerReseniada(),
      resenia: this.resenia,
      historial: this.historial,
    };
  }
}
