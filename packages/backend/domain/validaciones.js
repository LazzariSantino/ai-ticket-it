import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";

export function validarTexto(valor, mensaje) {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new UnprocessableEntityError(mensaje);
  }
  return valor.trim();
}

// Acepta un Date o un texto con fecha (como llega en el JSON) y devuelve siempre un Date
export function validarFecha(fecha, mensaje) {
  const fechaComoDate = fecha instanceof Date ? fecha : new Date(fecha);
  if ((!(fecha instanceof Date) && typeof fecha !== "string") || Number.isNaN(fechaComoDate.getTime())) {
    throw new UnprocessableEntityError(mensaje);
  }
  return fechaComoDate;
}
