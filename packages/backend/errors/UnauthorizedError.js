import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Tenés que iniciar sesión") {
    super(message, 401);
  }
}
