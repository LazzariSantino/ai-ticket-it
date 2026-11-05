import { Evento } from "../domain/Evento.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";
import { ValidationError } from "../errors/ValidationError.js";

// Cómo se ordena cada criterio si no se indica dirección: lo más barato, lo más próximo y lo mejor puntuado primero
const ORDENES = {
  precio: { direccion: "asc", valor: (evento) => evento.precioMinimo },
  fecha: { direccion: "asc", valor: (evento) => evento.fecha.getTime() },
  puntaje: { direccion: "desc", valor: (evento) => evento.organizador.puntaje },
};

export class EventoService {
  constructor(eventoRepository, categoriaRepository, reseniaRepository, reloj = () => new Date()) {
    this._eventoRepository = eventoRepository;
    this._categoriaRepository = categoriaRepository;
    this._reseniaRepository = reseniaRepository;
    this._reloj = reloj;
  }

  async crearEvento(organizador, { nombre, descripcion, categoriaId, fecha, tiposEntrada, multimedia }) {
    const categoria = await this._categoriaRepository.buscarPorId(categoriaId);
    if (!categoria) {
      throw new UnprocessableEntityError(`La categoría con id ${categoriaId} no existe`);
    }

    const evento = new Evento({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador });
    if (evento.yaSeRealizo(this._reloj())) {
      throw new UnprocessableEntityError("La fecha del evento tiene que ser futura");
    }

    await this._eventoRepository.guardar(evento);
    return this._conReputacion(evento, await this.reputacionDe(organizador.id));
  }

  // Sólo muestra eventos que todavía no se realizaron
  async buscarEventos({ texto, categoriaId, precioMinimo, precioMaximo, orden = "fecha", direccion } = {}) {
    const criterio = ORDENES[orden];
    if (!criterio) {
      throw new ValidationError(`No se puede ordenar por ${orden}. Opciones: ${Object.keys(ORDENES).join(", ")}`);
    }
    if (direccion !== undefined && !["asc", "desc"].includes(direccion)) {
      throw new ValidationError("La dirección del orden debe ser asc o desc");
    }

    const ahora = this._reloj();
    const eventos = await this._eventoRepository.buscarDonde(
      (evento) =>
        !evento.yaSeRealizo(ahora) &&
        (!texto || evento.coincideCon(texto)) &&
        (categoriaId === undefined || evento.categoria.id === categoriaId) &&
        evento.tuPrecioEstaEntre(precioMinimo ?? 0, precioMaximo ?? Infinity),
    );

    const conReputacion = await this._conReputaciones(eventos);
    return this._ordenar(conReputacion, criterio, direccion ?? criterio.direccion);
  }

  // Los que no tienen valor (por ejemplo, organizadores sin reseñas) quedan siempre al final
  _ordenar(eventos, criterio, direccion) {
    const signo = direccion === "asc" ? 1 : -1;
    return eventos.sort((a, b) => {
      const valorA = criterio.valor(a);
      const valorB = criterio.valor(b);
      if (valorA === null) return valorB === null ? 0 : 1;
      if (valorB === null) return -1;
      return (valorA - valorB) * signo;
    });
  }

  async obtenerEvento(eventoId, usuario) {
    const evento = await this.buscarEventoExistente(eventoId);
    // Las reseñas se buscan una sola vez: sirven para mostrarlas y para calcular el puntaje
    const resenias = await this._reseniaRepository.buscarPorOrganizador(evento.organizador.id);
    return {
      ...this._conReputacion(evento, this._calcularReputacion(resenias)),
      esFavorito: usuario.esFavorito(evento),
      esOrganizador: evento.esOrganizadoPor(usuario),
      reseniasDelOrganizador: resenias,
    };
  }

  async listarEventosDelOrganizador(organizador) {
    const eventos = await this._eventoRepository.buscarPorOrganizador(organizador.id);
    eventos.sort((a, b) => a.fecha - b.fecha);
    return await this._conReputaciones(eventos);
  }

  async agregarFavorito(usuario, eventoId) {
    usuario.agregarFavorito(await this.buscarEventoExistente(eventoId));
    return usuario;
  }

  async quitarFavorito(usuario, eventoId) {
    usuario.quitarFavorito(await this.buscarEventoExistente(eventoId));
    return usuario;
  }

  async listarFavoritos(usuario) {
    return await this._conReputaciones(usuario.favoritos);
  }

  async buscarEventoExistente(eventoId) {
    const evento = await this._eventoRepository.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`El evento con id ${eventoId} no existe`);
    }
    return evento;
  }

  // Puntaje promedio de las reseñas de todos los eventos del organizador, con un decimal
  async reputacionDe(organizadorId) {
    return this._calcularReputacion(await this._reseniaRepository.buscarPorOrganizador(organizadorId));
  }

  _calcularReputacion(resenias) {
    if (resenias.length === 0) {
      return { puntaje: null, cantidadResenias: 0 };
    }
    const promedio = resenias.reduce((suma, resenia) => suma + resenia.puntuacion, 0) / resenias.length;
    return { puntaje: Math.round(promedio * 10) / 10, cantidadResenias: resenias.length };
  }

  _conReputacion(evento, reputacion) {
    const json = evento.toJSON();
    return { ...json, organizador: { ...json.organizador, ...reputacion } };
  }

  // Calcula la reputación una sola vez por organizador, aunque tenga muchos eventos en la lista
  async _conReputaciones(eventos) {
    const reputaciones = new Map();
    for (const organizadorId of new Set(eventos.map((evento) => evento.organizador.id))) {
      reputaciones.set(organizadorId, await this.reputacionDe(organizadorId));
    }
    return eventos.map((evento) => this._conReputacion(evento, reputaciones.get(evento.organizador.id)));
  }
}
