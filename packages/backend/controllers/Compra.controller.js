import { ValidationError } from "../errors/ValidationError.js";
import { numeroOpcional, validarCamposRequeridos } from "./validaciones.js";

export class CompraController {
  constructor(compraService) {
    this.compraService = compraService;
  }

  // Las compras se devuelven armadas por el service, que conoce el reloj de la aplicación
  presentar(compra) {
    return this.compraService.presentar(compra);
  }

  presentarTodas(compras) {
    return Promise.all(compras.map((compra) => this.presentar(compra)));
  }

  async comprar(req, res) {
    validarCamposRequeridos(req.body, ["eventoId", "tipoEntradaId", "cantidad"]);
    const { eventoId, tipoEntradaId, cantidad } = req.body;

    const compra = await this.compraService.comprar(req.usuario, { eventoId, tipoEntradaId, cantidad });
    return res.status(201).json(await this.presentar(compra));
  }

  async listarMisCompras(req, res) {
    const compras = await this.compraService.listarMisCompras(req.usuario, { estado: req.query.estado });
    return res.status(200).json(await this.presentarTodas(compras));
  }

  async listarComprasDeEvento(req, res) {
    const resultado = await this.compraService.listarComprasDeEvento(req.usuario, req.params.eventoId, {
      estado: req.query.estado,
    });
    return res.status(200).json({ ...resultado, compras: await this.presentarTodas(resultado.compras) });
  }

  async obtenerCompra(req, res) {
    const compra = await this.compraService.obtenerCompra(req.usuario, req.params.id);
    return res.status(200).json(await this.presentar(compra));
  }

  async pagar(req, res) {
    const compra = await this.compraService.pagar(req.usuario, req.params.id);
    return res.status(200).json(await this.presentar(compra));
  }

  async cancelar(req, res) {
    const compra = await this.compraService.cancelar(req.usuario, req.params.id);
    return res.status(200).json(await this.presentar(compra));
  }

  async marcarUtilizada(req, res) {
    const compra = await this.compraService.marcarUtilizada(req.usuario, req.params.id);
    return res.status(200).json(await this.presentar(compra));
  }

  // GET /compras/:id/mensajes?desde=N devuelve los mensajes a partir de la posición N (los nuevos)
  async listarMensajes(req, res) {
    const desde = numeroOpcional(req.query.desde, "desde") ?? 0;
    if (!Number.isInteger(desde) || desde < 0) {
      throw new ValidationError("El parámetro desde debe ser un número entero mayor o igual a 0");
    }
    const mensajes = await this.compraService.listarMensajes(req.usuario, req.params.id, { desde });
    return res.status(200).json(mensajes);
  }

  async enviarMensaje(req, res) {
    validarCamposRequeridos(req.body, ["mensaje"]);

    const mensaje = await this.compraService.enviarMensaje(req.usuario, req.params.id, req.body.mensaje);
    return res.status(201).json(mensaje);
  }

  async reseniar(req, res) {
    validarCamposRequeridos(req.body, ["puntuacion", "detalle"]);
    const { puntuacion, detalle } = req.body;

    const resenia = await this.compraService.reseniar(req.usuario, req.params.id, { puntuacion, detalle });
    return res.status(201).json(resenia);
  }
}
