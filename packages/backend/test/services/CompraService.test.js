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

  beforeEach(async () => {
    ahora = new Date("2026-11-01T12:00:00.000Z");
    const reloj = () => ahora;
    const categoriaRepository = new CategoriaRepository();
    await new CategoriaService(categoriaRepository).cargarCategoriasIniciales();
    const eventoService = new EventoService(
      new EventoRepository(),
      categoriaRepository,
      new ReseniaRepository(),
      reloj,
    );
    service = new CompraService(new CompraRepository(), eventoService, reloj);
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
});
