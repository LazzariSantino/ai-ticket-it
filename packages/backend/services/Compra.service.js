import { Compra, PLAZO_PARA_PAGAR_POR_DEFECTO_MINUTOS } from "../domain/Compra.js";
import { EstadoCompra, esEstadoCompraValido } from "../domain/EstadoCompra.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";

export class CompraService {
  constructor(
    compraRepository,
    eventoService,
    reseniaRepository,
    reloj = () => new Date(),
    plazoParaPagarEnMinutos = PLAZO_PARA_PAGAR_POR_DEFECTO_MINUTOS,
  ) {
    this._compraRepository = compraRepository;
    this._plazoParaPagarEnMinutos = plazoParaPagarEnMinutos;
    this._eventoService = eventoService;
    this._reseniaRepository = reseniaRepository;
    this._reloj = reloj;
  }

  async comprar(comprador, { eventoId, tipoEntradaId, cantidad }) {
    const evento = await this._eventoService.buscarEventoExistente(eventoId);
    const compra = Compra.realizar({
      comprador,
      evento,
      tipoEntradaId,
      cantidad,
      ahora: this._reloj(),
      plazoParaPagarEnMinutos: this._plazoParaPagarEnMinutos,
    });
    return await this._compraRepository.guardar(compra);
  }

  // Las compras del usuario, de la más nueva a la más vieja, opcionalmente de un solo estado
  async listarMisCompras(comprador, { estado } = {}) {
    this._validarEstado(estado);
    const compras = await this._compraRepository.buscarPorComprador(comprador.id);
    return compras.filter((compra) => !estado || compra.estado === estado).sort((a, b) => b.fecha - a.fecha);
  }

  // Para el organizador: las compras del evento, cuántas hay en cada estado y el cupo que queda de cada tipo
  async listarComprasDeEvento(organizador, eventoId, { estado } = {}) {
    this._validarEstado(estado);
    const evento = await this._eventoService.buscarEventoExistente(eventoId);
    if (!evento.esOrganizadoPor(organizador)) {
      throw new ForbiddenError("Sólo el organizador puede ver las compras de su evento");
    }

    const compras = await this._compraRepository.buscarPorEvento(evento.id);
    const cantidadPorEstado = Object.fromEntries(Object.values(EstadoCompra).map((e) => [e, 0]));
    compras.forEach((compra) => cantidadPorEstado[compra.estado]++);

    return {
      evento: { id: evento.id, nombre: evento.nombre, fecha: evento.fecha },
      tiposEntrada: evento.tiposEntrada,
      cantidadPorEstado,
      compras: compras.filter((compra) => !estado || compra.estado === estado).sort((a, b) => b.fecha - a.fecha),
    };
  }

  async obtenerCompra(usuario, compraId) {
    const compra = await this._compraRepository.buscarPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`La compra con id ${compraId} no existe`);
    }
    if (!compra.participa(usuario)) {
      throw new ForbiddenError("Sólo el comprador y el organizador del evento pueden ver esta compra");
    }
    return compra;
  }

  async pagar(usuario, compraId) {
    const compra = await this.obtenerCompra(usuario, compraId);
    compra.pagar(usuario, this._reloj());
    return await this._compraRepository.guardar(compra);
  }

  async cancelar(usuario, compraId) {
    const compra = await this.obtenerCompra(usuario, compraId);
    compra.cancelar(usuario, this._reloj());
    return await this._compraRepository.guardar(compra);
  }

  async marcarUtilizada(usuario, compraId) {
    const compra = await this.obtenerCompra(usuario, compraId);
    compra.marcarUtilizada(usuario, this._reloj());
    return await this._compraRepository.guardar(compra);
  }

  async listarMensajes(usuario, compraId) {
    const compra = await this.obtenerCompra(usuario, compraId);
    return compra.mensajes;
  }

  async enviarMensaje(usuario, compraId, texto) {
    const compra = await this.obtenerCompra(usuario, compraId);
    const mensaje = compra.enviarMensaje(usuario, texto, this._reloj());
    await this._compraRepository.guardar(compra);
    return mensaje;
  }

  // La reseña queda guardada aparte para poder mostrarla en los eventos del organizador
  async reseniar(usuario, compraId, { detalle, puntuacion }) {
    const compra = await this.obtenerCompra(usuario, compraId);
    const resenia = compra.reseniar(usuario, { detalle, puntuacion }, this._reloj());
    await this._reseniaRepository.guardar(resenia);
    await this._compraRepository.guardar(compra);
    return resenia;
  }

  // Cancela las compras que no se pagaron a tiempo y libera su cupo. Lo ejecuta periódicamente el servidor.
  async vencerComprasPendientes() {
    const ahora = this._reloj();
    const vencidas = await this._compraRepository.buscarPendientesVencidas(ahora);
    for (const compra of vencidas) {
      compra.vencer(ahora);
      await this._compraRepository.guardar(compra);
    }
    return vencidas.length;
  }

  // Arma la respuesta de una compra con el reloj de la aplicación
  async presentar(compra) {
    return compra.aJSON(this._reloj());
  }

  _validarEstado(estado) {
    if (estado !== undefined && !esEstadoCompraValido(estado)) {
      throw new ValidationError(`El estado ${estado} no existe. Opciones: ${Object.values(EstadoCompra).join(", ")}`);
    }
  }
}
