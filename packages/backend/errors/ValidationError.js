import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message = "Datos de validación inválidos") {
    super(message, 400);
  }
}
