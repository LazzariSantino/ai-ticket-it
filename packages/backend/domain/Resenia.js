import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTexto } from "./validaciones.js";

export const PUNTUACION_MINIMA = 1;
export const PUNTUACION_MAXIMA = 5;

export class Resenia {
  constructor({ comprador, evento, detalle, puntuacion, fecha = new Date() }) {
    if (
      typeof puntuacion !== "number" ||
      !Number.isFinite(puntuacion) ||
      puntuacion < PUNTUACION_MINIMA ||
      puntuacion > PUNTUACION_MAXIMA
    ) {
      throw new UnprocessableEntityError(
        `La puntuación debe ser un número entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}`,
      );
    }
    this.detalle = validarTexto(detalle, "La reseña debe tener un comentario");
    this.puntuacion = puntuacion;
    this.comprador = comprador;
    this.evento = evento;
    this.fecha = fecha;
  }

  toJSON() {
    return {
      id: this.id,
      comprador: this.comprador.resumen(),
      evento: { id: this.evento.id, nombre: this.evento.nombre, fecha: this.evento.fecha },
      detalle: this.detalle,
      puntuacion: this.puntuacion,
      fecha: this.fecha,
    };
  }
}
