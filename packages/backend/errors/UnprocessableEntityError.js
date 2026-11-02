import { AppError } from "./AppError.js";

// Los datos tienen el formato correcto pero rompen una regla del negocio
export class UnprocessableEntityError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}
