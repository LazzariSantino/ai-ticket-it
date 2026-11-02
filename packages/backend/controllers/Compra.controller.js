import { validarCamposRequeridos } from "./validaciones.js";

export class CompraController {
  constructor(compraService) {
    this.compraService = compraService;
  }

  async comprar(req, res) {
    validarCamposRequeridos(req.body, ["eventoId", "tipoEntradaId", "cantidad"]);
    const { eventoId, tipoEntradaId, cantidad } = req.body;

    const compra = await this.compraService.comprar(req.usuario, { eventoId, tipoEntradaId, cantidad });
    return res.status(201).json(compra);
  }

  async listarMisCompras(req, res) {
    const compras = await this.compraService.listarMisCompras(req.usuario, { estado: req.query.estado });
    return res.status(200).json(compras);
  }

  async listarComprasDeEvento(req, res) {
    const resultado = await this.compraService.listarComprasDeEvento(req.usuario, req.params.eventoId, {
      estado: req.query.estado,
    });
    return res.status(200).json(resultado);
  }

  async obtenerCompra(req, res) {
    const compra = await this.compraService.obtenerCompra(req.usuario, req.params.id);
    return res.status(200).json(compra);
  }

  async pagar(req, res) {
    const compra = await this.compraService.pagar(req.usuario, req.params.id);
    return res.status(200).json(compra);
  }

  async cancelar(req, res) {
    const compra = await this.compraService.cancelar(req.usuario, req.params.id);
    return res.status(200).json(compra);
  }

  async marcarUtilizada(req, res) {
    const compra = await this.compraService.marcarUtilizada(req.usuario, req.params.id);
    return res.status(200).json(compra);
  }

  async listarMensajes(req, res) {
    const mensajes = await this.compraService.listarMensajes(req.usuario, req.params.id);
    return res.status(200).json(mensajes);
  }

  async enviarMensaje(req, res) {
    validarCamposRequeridos(req.body, ["mensaje"]);

    const mensaje = await this.compraService.enviarMensaje(req.usuario, req.params.id, req.body.mensaje);
    return res.status(201).json(mensaje);
  }
}
