import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { contraseniaCoincide, hashearContrasenia } from "./contrasenias.js";
import { validarTexto } from "./validaciones.js";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LARGO_MINIMO_CONTRASENIA = 6;

// Un mismo usuario puede comprar entradas y también organizar sus propios eventos
export class Usuario {
  constructor({ nombre, apellido, email, hashContrasenia, favoritos = [] }) {
    this.nombre = validarTexto(nombre, "El usuario debe tener un nombre");
    this.apellido = validarTexto(apellido, "El usuario debe tener un apellido");
    this.email = Usuario.normalizarEmail(email);
    if (!FORMATO_EMAIL.test(this.email)) {
      throw new UnprocessableEntityError("El email no tiene un formato válido");
    }
    if (!hashContrasenia) {
      throw new UnprocessableEntityError("El usuario debe tener una contraseña");
    }
    this.hashContrasenia = hashContrasenia;
    this.favoritos = favoritos;
  }

  static registrar({ nombre, apellido, email, contrasenia }) {
    if (typeof contrasenia !== "string" || contrasenia.length < LARGO_MINIMO_CONTRASENIA) {
      throw new UnprocessableEntityError(
        `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENIA} caracteres`,
      );
    }
    return new Usuario({ nombre, apellido, email, hashContrasenia: hashearContrasenia(contrasenia) });
  }

  static normalizarEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
  }

  verificarContrasenia(contrasenia) {
    return typeof contrasenia === "string" && contraseniaCoincide(contrasenia, this.hashContrasenia);
  }

  esFavorito(evento) {
    return this.favoritos.some((favorito) => favorito.id === evento.id);
  }

  agregarFavorito(evento) {
    if (!this.esFavorito(evento)) {
      this.favoritos.push(evento);
    }
  }

  quitarFavorito(evento) {
    this.favoritos = this.favoritos.filter((favorito) => favorito.id !== evento.id);
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  // Lo que se muestra de un usuario cuando aparece dentro de otro recurso (organizador, comprador, autor)
  resumen() {
    return { id: this.id, nombre: this.nombre, apellido: this.apellido };
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      favoritos: this.favoritos.map((evento) => evento.id),
    };
  }
}
