import { AppError } from "../errors/AppError.js";

// Último middleware de la cadena: traduce las excepciones a respuestas HTTP con un formato único
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "fail", message: "El cuerpo de la request no es un JSON válido" });
  }

  console.error(err);
  return res.status(500).json({ status: "error", message: "Error interno del servidor" });
}
