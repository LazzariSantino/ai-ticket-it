import { ValidationError } from "../errors/ValidationError.js";

// Valida la forma del body (que vengan los campos). Las reglas del negocio las valida el dominio.
export function validarCamposRequeridos(body, campos) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("El cuerpo de la request es inválido");
  }
  const faltantes = campos.filter((campo) => body[campo] === undefined || body[campo] === null || body[campo] === "");
  if (faltantes.length > 0) {
    throw new ValidationError(`Faltan campos requeridos: ${faltantes.join(", ")}`);
  }
}

export function numeroOpcional(valor, nombre) {
  if (valor === undefined || valor === "") {
    return undefined;
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    throw new ValidationError(`El parámetro ${nombre} debe ser un número`);
  }
  return numero;
}
