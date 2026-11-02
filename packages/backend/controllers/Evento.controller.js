import { numeroOpcional, validarCamposRequeridos } from "./validaciones.js";

export class EventoController {
  constructor(eventoService) {
    this.eventoService = eventoService;
  }

  async buscarEventos(req, res) {
    const { q, categoriaId, precioMinimo, precioMaximo, orden, direccion } = req.query;

    const eventos = await this.eventoService.buscarEventos({
      texto: q,
      categoriaId: numeroOpcional(categoriaId, "categoriaId"),
      precioMinimo: numeroOpcional(precioMinimo, "precioMinimo"),
      precioMaximo: numeroOpcional(precioMaximo, "precioMaximo"),
      orden,
      direccion,
    });
    return res.status(200).json(eventos);
  }

  async crearEvento(req, res) {
    validarCamposRequeridos(req.body, ["nombre", "descripcion", "categoriaId", "fecha", "tiposEntrada"]);
    const { nombre, descripcion, categoriaId, fecha, tiposEntrada, multimedia } = req.body;

    const evento = await this.eventoService.crearEvento(req.usuario, {
      nombre,
      descripcion,
      categoriaId,
      fecha,
      tiposEntrada,
      multimedia,
    });
    return res.status(201).json(evento);
  }

  async obtenerEvento(req, res) {
    const evento = await this.eventoService.obtenerEvento(req.params.id, req.usuario);
    return res.status(200).json(evento);
  }

  async listarMisEventos(req, res) {
    const eventos = await this.eventoService.listarEventosDelOrganizador(req.usuario);
    return res.status(200).json(eventos);
  }

  async listarFavoritos(req, res) {
    const eventos = await this.eventoService.listarFavoritos(req.usuario);
    return res.status(200).json(eventos);
  }

  async agregarFavorito(req, res) {
    const usuario = await this.eventoService.agregarFavorito(req.usuario, req.params.id);
    return res.status(200).json(usuario);
  }

  async quitarFavorito(req, res) {
    const usuario = await this.eventoService.quitarFavorito(req.usuario, req.params.id);
    return res.status(200).json(usuario);
  }
}
