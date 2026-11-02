import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { validarTexto } from "./validaciones.js";

// `cupo` es lo que queda disponible para vender; `cupoTotal` es lo que definió el organizador
export class TipoEntrada {
  constructor({ nombre, descripcion = "", precio, cupo }) {
    this.nombre = validarTexto(nombre, "El tipo de entrada debe tener un nombre");

    if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0) {
      throw new UnprocessableEntityError(`El precio de la entrada ${this.nombre} debe ser un número mayor o igual a 0`);
    }
    if (!Number.isInteger(cupo) || cupo <= 0) {
      throw new UnprocessableEntityError(`El cupo de la entrada ${this.nombre} debe ser un número entero mayor a 0`);
    }

    this.descripcion = descripcion;
    this.precio = precio;
    this.cupoTotal = cupo;
    this.cupo = cupo;
  }

  hayCupoPara(cantidad) {
    return cantidad <= this.cupo;
  }

  reservar(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new UnprocessableEntityError(
        `No hay cupo suficiente para ${cantidad} entradas ${this.nombre}: quedan ${this.cupo}`,
      );
    }
    this.cupo -= cantidad;
  }

  liberar(cantidad) {
    this.cupo = Math.min(this.cupo + cantidad, this.cupoTotal);
  }

  get vendidas() {
    return this.cupoTotal - this.cupo;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      cupoTotal: this.cupoTotal,
      cupoDisponible: this.cupo,
      vendidas: this.vendidas,
    };
  }
}
