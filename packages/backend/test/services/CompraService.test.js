import { CompraService } from "../../services/Compra.service.js";
import { EventoService } from "../../services/Evento.service.js";
import { CategoriaService } from "../../services/Categoria.service.js";
import { CompraRepository } from "../../repository/Compra.repository.js";
import { EventoRepository } from "../../repository/Evento.repository.js";
import { CategoriaRepository } from "../../repository/Categoria.repository.js";
import { ReseniaRepository } from "../../repository/Resenia.repository.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { crearUsuario, datosDeEvento } from "../helpers.js";

describe("CompraService", () => {
  let ahora;
  const organizadora = crearUsuario(1, "orga");
  const compradora = crearUsuario(2, "compradora");
  const otro = crearUsuario(3, "otro");

  let service;
  let evento;
  let reseniaRepository;

  beforeEach(async () => {
    ahora = new Date("2026-11-01T12:00:00.000Z");
    const reloj = () => ahora;
    const categoriaRepository = new CategoriaRepository();
    await new CategoriaService(categoriaRepository).cargarCategoriasIniciales();
    reseniaRepository = new ReseniaRepository();
    const eventoService = new EventoService(new EventoRepository(), categoriaRepository, reseniaRepository, reloj);
    service = new CompraService(new CompraRepository(), eventoService, reseniaRepository, reloj);
    evento = await eventoService.crearEvento(organizadora, datosDeEvento(1));
  });

  const comprar = (cantidad = 2, tipoEntradaId = 1, quien = compradora) =>
    service.comprar(quien, { eventoId: evento.id, tipoEntradaId, cantidad });

  describe("comprar", () => {
    it("guarda la compra pendiente con el total calculado", async () => {
      const compra = await comprar(3, 2);

      expect(compra.id).toBe(1);
      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
      expect(compra.total).toBe(90000);
      expect(compra.tipoEntrada.cupo).toBe(7);
    });

    it("falla si el evento no existe", async () => {
      await expect(service.comprar(compradora, { eventoId: 99, tipoEntradaId: 1, cantidad: 1 })).rejects.toThrow(
        NotFoundError,
      );
    });

    it("falla si se supera el cupo disponible", async () => {
      await comprar(8, 2);

      await expect(comprar(3, 2, otro)).rejects.toThrow("No hay cupo suficiente para 3 entradas VIP: quedan 2");
    });
  });

  describe("listarMisCompras", () => {
    it("devuelve sólo las del comprador, de la más nueva a la más vieja", async () => {
      const primera = await comprar(1);
      ahora = new Date("2026-11-02T12:00:00.000Z");
      const segunda = await comprar(1);
      await comprar(1, 1, otro);

      const compras = await service.listarMisCompras(compradora);

      expect(compras.map((compra) => compra.id)).toEqual([segunda.id, primera.id]);
    });

    it("filtra por estado y valida que el estado exista", async () => {
      await comprar(1);

      expect(await service.listarMisCompras(compradora, { estado: EstadoCompra.CONFIRMADA })).toEqual([]);
      await expect(service.listarMisCompras(compradora, { estado: "PAGADA" })).rejects.toThrow(ValidationError);
    });
  });

  describe("listarComprasDeEvento", () => {
    it("muestra al organizador las compras, la cantidad por estado y el cupo que queda de cada tipo", async () => {
      await comprar(2, 1);
      await comprar(1, 2, otro);

      const resultado = await service.listarComprasDeEvento(organizadora, evento.id);

      expect(resultado.compras).toHaveLength(2);
      expect(resultado.cantidadPorEstado).toEqual({
        PENDIENTE: 2,
        CONFIRMADA: 0,
        UTILIZADA: 0,
        CANCELADA: 0,
        REEMBOLSADA: 0,
      });
      expect(resultado.tiposEntrada.map((tipo) => [tipo.nombre, tipo.cupo])).toEqual([
        ["General", 98],
        ["VIP", 9],
      ]);
    });

    it("nadie más que el organizador puede verlas", async () => {
      await expect(service.listarComprasDeEvento(compradora, evento.id)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("obtenerCompra", () => {
    it("la pueden ver el comprador y el organizador", async () => {
      const compra = await comprar();

      expect(await service.obtenerCompra(compradora, compra.id)).toBe(compra);
      expect(await service.obtenerCompra(organizadora, compra.id)).toBe(compra);
    });

    it("nadie más puede verla", async () => {
      const compra = await comprar();

      await expect(service.obtenerCompra(otro, compra.id)).rejects.toThrow(ForbiddenError);
    });

    it("falla si no existe", async () => {
      await expect(service.obtenerCompra(compradora, 99)).rejects.toThrow("La compra con id 99 no existe");
    });
  });

  describe("cambios de estado", () => {
    const diaDelEvento = new Date("2026-12-10T22:00:00.000Z");
    const despuesDelEvento = new Date("2026-12-12T12:00:00.000Z");

    it("pagar confirma la compra y muestra los días que faltan", async () => {
      const compra = await comprar();

      await service.pagar(compradora, compra.id);

      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(compra.diasParaEvento(ahora)).toBe(39);
    });

    it("cancelar una compra pagada la reembolsa y devuelve el cupo", async () => {
      const compra = await comprar(2);
      await service.pagar(compradora, compra.id);

      await service.cancelar(compradora, compra.id);

      expect(compra.estado).toBe(EstadoCompra.REEMBOLSADA);
      expect(compra.tipoEntrada.cupo).toBe(100);
    });

    it("no se puede cancelar después del evento", async () => {
      const compra = await comprar();
      await service.pagar(compradora, compra.id);
      ahora = despuesDelEvento;

      await expect(service.cancelar(compradora, compra.id)).rejects.toThrow(
        "No se puede cancelar una compra de un evento que ya se realizó",
      );
    });

    it("el organizador marca la compra como utilizada el día del evento y ya no se puede cancelar", async () => {
      const compra = await comprar();
      await service.pagar(compradora, compra.id);
      ahora = diaDelEvento;

      await service.marcarUtilizada(organizadora, compra.id);

      expect(compra.estado).toBe(EstadoCompra.UTILIZADA);
      await expect(service.cancelar(compradora, compra.id)).rejects.toThrow(
        "No se puede cancelar una compra de un evento que ya se realizó",
      );
    });

    it("alguien ajeno a la compra no puede cambiarle el estado", async () => {
      const compra = await comprar();

      await expect(service.pagar(otro, compra.id)).rejects.toThrow(ForbiddenError);
      await expect(service.cancelar(otro, compra.id)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("reseniar", () => {
    it("guarda la reseña para mostrarla en los eventos del organizador", async () => {
      const compra = await comprar();
      await service.pagar(compradora, compra.id);
      ahora = new Date("2026-12-10T22:00:00.000Z");
      await service.marcarUtilizada(organizadora, compra.id);

      await service.reseniar(compradora, compra.id, { puntuacion: 5, detalle: "Gran noche" });

      const resenias = await reseniaRepository.buscarPorOrganizador(organizadora.id);
      expect(resenias.map((r) => r.detalle)).toEqual(["Gran noche"]);
      expect(compra.resenia).toBe(resenias[0]);
    });

    it("no guarda nada si la compra todavía no se utilizó", async () => {
      const compra = await comprar();

      await expect(service.reseniar(compradora, compra.id, { puntuacion: 5, detalle: "Gran noche" })).rejects.toThrow(
        "Sólo se puede reseñar el evento una vez utilizada la entrada",
      );
      expect(await reseniaRepository.buscarTodos()).toEqual([]);
    });
  });

  describe("vencerComprasPendientes", () => {
    it("cancela sólo las pendientes fuera de plazo y devuelve el cupo al evento", async () => {
      const sinPagar = await comprar(3);
      const pagada = await comprar(2);
      await service.pagar(compradora, pagada.id);
      ahora = new Date("2026-11-02T12:00:00.000Z"); // 24 horas después

      const cantidad = await service.vencerComprasPendientes();

      expect(cantidad).toBe(1);
      expect(sinPagar.estado).toBe(EstadoCompra.CANCELADA);
      expect(pagada.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(sinPagar.tipoEntrada.cupo).toBe(98);
    });

    it("no hace nada mientras las compras estén dentro del plazo", async () => {
      await comprar();
      ahora = new Date("2026-11-02T11:59:00.000Z");

      expect(await service.vencerComprasPendientes()).toBe(0);
    });
  });
});
