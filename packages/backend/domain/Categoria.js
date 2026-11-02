import { validarTexto } from "./validaciones.js";

export class Categoria {
  constructor({ nombre, descripcion = "" }) {
    this.nombre = validarTexto(nombre, "La categoría debe tener un nombre");
    this.descripcion = descripcion;
  }

  toJSON() {
    return { id: this.id, nombre: this.nombre, descripcion: this.descripcion };
  }
}
