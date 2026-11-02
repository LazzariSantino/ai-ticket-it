import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTexto } from "./validaciones.js";

const LARGO_MAXIMO = 1000;

export class Mensaje {
  constructor({ usuario, mensaje, enviado = new Date() }) {
    this.mensaje = validarTexto(mensaje, "El mensaje no puede estar vacío");
    if (this.mensaje.length > LARGO_MAXIMO) {
      throw new UnprocessableEntityError(`El mensaje no puede superar los ${LARGO_MAXIMO} caracteres`);
    }
    this.usuario = usuario;
    this.enviado = enviado;
  }

  toJSON() {
    return { usuario: this.usuario.resumen(), mensaje: this.mensaje, enviado: this.enviado };
  }
}
