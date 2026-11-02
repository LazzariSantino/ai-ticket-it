import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { TipoEntrada } from "./TipoEntrada.js";
import { validarFecha, validarTexto } from "./validaciones.js";

// Pasa a minúsculas y saca las tildes, para que "Música" y "musica" coincidan en las búsquedas
export function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export class Evento {
  constructor({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia = [], organizador }) {
    if (!organizador) {
      throw new UnprocessableEntityError("El evento debe tener un organizador");
    }
    if (!categoria) {
      throw new UnprocessableEntityError("El evento debe tener una categoría");
    }

    this.nombre = validarTexto(nombre, "El evento debe tener un nombre");
    this.descripcion = validarTexto(descripcion, "El evento debe tener una descripción");
    this.fecha = validarFecha(fecha, "La fecha del evento no es válida");
    this.categoria = categoria;
    this.multimedia = this._validarMultimedia(multimedia);
    this.tiposEntrada = this._crearTiposEntrada(tiposEntrada);
    this.organizador = organizador;
  }

  _validarMultimedia(multimedia) {
    if (!Array.isArray(multimedia) || multimedia.some((url) => typeof url !== "string" || !url.trim())) {
      throw new UnprocessableEntityError("La multimedia del evento debe ser una lista de URLs");
    }
    return multimedia.map((url) => url.trim());
  }

  // Cada tipo de entrada se identifica por su posición dentro del evento (1, 2, 3...)
  _crearTiposEntrada(tiposEntrada) {
    if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
      throw new UnprocessableEntityError("El evento debe ofrecer al menos un tipo de entrada");
    }

    const tipos = tiposEntrada.map((tipo) => (tipo instanceof TipoEntrada ? tipo : new TipoEntrada(tipo)));

    const nombres = tipos.map((tipo) => normalizarTexto(tipo.nombre));
    if (new Set(nombres).size !== nombres.length) {
      throw new UnprocessableEntityError("El evento no puede tener dos tipos de entrada con el mismo nombre");
    }

    tipos.forEach((tipo, indice) => (tipo.id = indice + 1));
    return tipos;
  }

  tuPrecioEstaEntre(minimo = 0, maximo = Infinity) {
    return this.tiposEntrada.some((tipo) => tipo.precio >= minimo && tipo.precio <= maximo);
  }

  get precioMinimo() {
    return Math.min(...this.tiposEntrada.map((tipo) => tipo.precio));
  }

  get entradasDisponibles() {
    return this.tiposEntrada.reduce((total, tipo) => total + tipo.cupo, 0);
  }

  yaSeRealizo(ahora = new Date()) {
    return this.fecha.getTime() <= ahora.getTime();
  }

  esOrganizadoPor(usuario) {
    return this.organizador.id === usuario.id;
  }

  buscarTipoEntrada(tipoEntradaId) {
    return this.tiposEntrada.find((tipo) => tipo.id === Number(tipoEntradaId));
  }

  // Busca el texto en el nombre, la descripción y la categoría, sin importar mayúsculas ni tildes
  coincideCon(texto) {
    const buscado = normalizarTexto(texto.trim());
    return [this.nombre, this.descripcion, this.categoria.nombre].some((campo) =>
      normalizarTexto(campo).includes(buscado),
    );
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoria: this.categoria,
      fecha: this.fecha,
      multimedia: this.multimedia,
      organizador: this.organizador.resumen(),
      tiposEntrada: this.tiposEntrada,
      precioMinimo: this.precioMinimo,
      entradasDisponibles: this.entradasDisponibles,
    };
  }
}
