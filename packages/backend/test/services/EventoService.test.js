import { EventoService } from "../../services/Evento.service.js";
import { CategoriaService } from "../../services/Categoria.service.js";
import { EventoRepository } from "../../repository/Evento.repository.js";
import { CategoriaRepository } from "../../repository/Categoria.repository.js";
import { ReseniaRepository } from "../../repository/Resenia.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { crearUsuario, datosDeEvento } from "../helpers.js";

const RECITALES = 1;
const TEATRO = 2;

describe("EventoService", () => {
  const ahora = new Date("2026-11-01T12:00:00.000Z");
  const organizadora = crearUsuario(1, "orga");
  const otroOrganizador = crearUsuario(2, "otro");
  const compradora = crearUsuario(3, "compradora");

  let service;
  let reseniaRepository;

  beforeEach(async () => {
    const categoriaRepository = new CategoriaRepository();
    await new CategoriaService(categoriaRepository).cargarCategoriasIniciales();
    reseniaRepository = new ReseniaRepository();
    service = new EventoService(new EventoRepository(), categoriaRepository, reseniaRepository, () => ahora);
  });

  describe("crearEvento", () => {
    it("crea el evento con sus tipos de entrada y el organizador sin reseñas", async () => {
      const evento = await service.crearEvento(organizadora, datosDeEvento(RECITALES));

      expect(evento.id).toBe(1);
      expect(evento.categoria.nombre).toBe("Recitales");
      expect(evento.tiposEntrada.map((tipo) => tipo.nombre)).toEqual(["General", "VIP"]);
      expect(evento.organizador).toEqual({
        id: 1,
        nombre: "orga",
        apellido: "Test",
        puntaje: null,
        cantidadResenias: 0,
      });
    });

    it("falla si la categoría no existe", async () => {
      await expect(service.crearEvento(organizadora, datosDeEvento(99))).rejects.toThrow(
        "La categoría con id 99 no existe",
      );
    });

    it("falla si la fecha ya pasó", async () => {
      await expect(
        service.crearEvento(organizadora, datosDeEvento(RECITALES, { fecha: "2026-10-01T21:00:00.000Z" })),
      ).rejects.toThrow("La fecha del evento tiene que ser futura");
    });
  });

  describe("buscarEventos", () => {
    let jazz;
    let obra;
    let festival;

    beforeEach(async () => {
      jazz = await service.crearEvento(organizadora, datosDeEvento(RECITALES));
      obra = await service.crearEvento(
        otroOrganizador,
        datosDeEvento(TEATRO, {
          nombre: "Hamlet",
          descripcion: "Clásico de Shakespeare",
          fecha: "2026-11-20T20:00:00.000Z",
          tiposEntrada: [{ nombre: "Platea", precio: 8000, cupo: 50 }],
        }),
      );
      festival = await service.crearEvento(
        otroOrganizador,
        datosDeEvento(RECITALES, {
          nombre: "Festival del Río",
          descripcion: "Bandas al aire libre",
          fecha: "2027-01-15T18:00:00.000Z",
          tiposEntrada: [{ nombre: "Campo", precio: 45000, cupo: 1000 }],
        }),
      );
    });

    const nombres = (eventos) => eventos.map((evento) => evento.nombre);

    it("sin filtros devuelve todos los eventos futuros ordenados por fecha", async () => {
      expect(nombres(await service.buscarEventos())).toEqual(["Hamlet", "Noche de Jazz", "Festival del Río"]);
    });

    it("filtra por texto en nombre, descripción o categoría", async () => {
      expect(nombres(await service.buscarEventos({ texto: "shakespeare" }))).toEqual(["Hamlet"]);
      expect(nombres(await service.buscarEventos({ texto: "AIRE libre" }))).toEqual(["Festival del Río"]);
    });

    it("filtra por categoría", async () => {
      expect(nombres(await service.buscarEventos({ categoriaId: RECITALES }))).toEqual([
        "Noche de Jazz",
        "Festival del Río",
      ]);
    });

    it("filtra por rango de precio", async () => {
      expect(nombres(await service.buscarEventos({ precioMinimo: 25000, precioMaximo: 35000 }))).toEqual([
        "Noche de Jazz",
      ]);
    });

    it("ordena por precio mínimo, de menor a mayor o al revés", async () => {
      expect(nombres(await service.buscarEventos({ orden: "precio" }))).toEqual([
        "Hamlet",
        "Noche de Jazz",
        "Festival del Río",
      ]);
      expect(nombres(await service.buscarEventos({ orden: "precio", direccion: "desc" }))).toEqual([
        "Festival del Río",
        "Noche de Jazz",
        "Hamlet",
      ]);
    });

    it("ordena por puntaje del organizador, dejando al final a los que no tienen reseñas", async () => {
      const eventoDeOtro = { organizador: otroOrganizador };
      await reseniaRepository.guardar({ evento: eventoDeOtro, puntuacion: 4, fecha: ahora });
      await reseniaRepository.guardar({ evento: eventoDeOtro, puntuacion: 5, fecha: ahora });

      const eventos = await service.buscarEventos({ orden: "puntaje" });

      expect(nombres(eventos)).toEqual(["Hamlet", "Festival del Río", "Noche de Jazz"]);
      expect(eventos[0].organizador.puntaje).toBe(4.5);
      expect(eventos[0].organizador.cantidadResenias).toBe(2);
    });

    it("no muestra eventos que ya se realizaron", async () => {
      const despuesDeHamlet = new Date("2026-11-25T00:00:00.000Z");
      const serviceMasTarde = new EventoService(
        service._eventoRepository,
        service._categoriaRepository,
        reseniaRepository,
        () => despuesDeHamlet,
      );

      expect(nombres(await serviceMasTarde.buscarEventos())).not.toContain("Hamlet");
    });

    it("falla con un criterio de orden desconocido", async () => {
      await expect(service.buscarEventos({ orden: "nombre" })).rejects.toThrow(ValidationError);
    });

    it("obtenerEvento incluye si es favorito y las reseñas del organizador", async () => {
      compradora.agregarFavorito(await service.buscarEventoExistente(obra.id));

      const detalle = await service.obtenerEvento(obra.id, compradora);

      expect(detalle.esFavorito).toBe(true);
      expect(detalle.esOrganizador).toBe(false);
      expect(detalle.reseniasDelOrganizador).toEqual([]);
    });

    it("obtenerEvento falla si el evento no existe", async () => {
      await expect(service.obtenerEvento(99, compradora)).rejects.toThrow(NotFoundError);
    });

    it("listarEventosDelOrganizador devuelve sólo los suyos", async () => {
      expect(nombres(await service.listarEventosDelOrganizador(otroOrganizador))).toEqual([
        "Hamlet",
        "Festival del Río",
      ]);
      expect(jazz.id).toBeDefined();
      expect(festival.id).toBeDefined();
    });
  });

  describe("favoritos", () => {
    it("agrega, lista y quita favoritos", async () => {
      const usuario = crearUsuario(5);
      const evento = await service.crearEvento(organizadora, datosDeEvento(RECITALES));

      await service.agregarFavorito(usuario, evento.id);
      expect((await service.listarFavoritos(usuario)).map((e) => e.id)).toEqual([evento.id]);

      await service.quitarFavorito(usuario, evento.id);
      expect(await service.listarFavoritos(usuario)).toEqual([]);
    });
  });
});
