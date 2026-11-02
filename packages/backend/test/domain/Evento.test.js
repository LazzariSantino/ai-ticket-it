import { Evento } from "../../domain/Evento.js";
import { Categoria } from "../../domain/Categoria.js";
import { TipoEntrada } from "../../domain/TipoEntrada.js";

describe("Dominio: Evento", () => {
  const organizador = { id: 1, nombre: "Ana", apellido: "Pérez", resumen: () => ({ id: 1 }) };
  const categoria = new Categoria({ nombre: "Música" });

  const datosValidos = () => ({
    nombre: "Noche de Jazz",
    descripcion: "Trío en vivo en el centro cultural",
    categoria,
    fecha: "2026-12-10T21:00:00.000Z",
    organizador,
    tiposEntrada: [
      { nombre: "General", precio: 10000, cupo: 100 },
      { nombre: "VIP", precio: 30000, cupo: 10 },
    ],
  });

  describe("Constructor", () => {
    it("error si falta el nombre, la descripción, la categoría o el organizador", () => {
      expect(() => new Evento({ ...datosValidos(), nombre: "" })).toThrow("El evento debe tener un nombre");
      expect(() => new Evento({ ...datosValidos(), descripcion: undefined })).toThrow(
        "El evento debe tener una descripción",
      );
      expect(() => new Evento({ ...datosValidos(), categoria: undefined })).toThrow(
        "El evento debe tener una categoría",
      );
      expect(() => new Evento({ ...datosValidos(), organizador: undefined })).toThrow(
        "El evento debe tener un organizador",
      );
    });

    it("error si la fecha no es válida", () => {
      expect(() => new Evento({ ...datosValidos(), fecha: "mañana" })).toThrow("La fecha del evento no es válida");
    });

    it("error si no ofrece tipos de entrada", () => {
      expect(() => new Evento({ ...datosValidos(), tiposEntrada: [] })).toThrow(
        "El evento debe ofrecer al menos un tipo de entrada",
      );
    });

    it("error si dos tipos de entrada se llaman igual", () => {
      const tiposEntrada = [
        { nombre: "Platea", precio: 1, cupo: 1 },
        { nombre: "platea", precio: 2, cupo: 2 },
      ];

      expect(() => new Evento({ ...datosValidos(), tiposEntrada })).toThrow(
        "El evento no puede tener dos tipos de entrada con el mismo nombre",
      );
    });

    it("error si la multimedia no es una lista de URLs", () => {
      expect(() => new Evento({ ...datosValidos(), multimedia: "foto.jpg" })).toThrow(
        "La multimedia del evento debe ser una lista de URLs",
      );
    });

    it("crea los tipos de entrada numerados desde 1 y convierte la fecha a Date", () => {
      const evento = new Evento(datosValidos());

      expect(evento.fecha).toBeInstanceOf(Date);
      expect(evento.tiposEntrada[0]).toBeInstanceOf(TipoEntrada);
      expect(evento.tiposEntrada.map((tipo) => tipo.id)).toEqual([1, 2]);
    });
  });

  describe("tuPrecioEstaEntre", () => {
    const evento = new Evento(datosValidos());

    it("es verdadero si algún tipo de entrada tiene un precio dentro del rango", () => {
      expect(evento.tuPrecioEstaEntre(5000, 15000)).toBe(true);
      expect(evento.tuPrecioEstaEntre(25000, 40000)).toBe(true);
    });

    it("es falso si ningún tipo de entrada entra en el rango", () => {
      expect(evento.tuPrecioEstaEntre(11000, 29000)).toBe(false);
    });

    it("sin límites acepta cualquier precio", () => {
      expect(evento.tuPrecioEstaEntre()).toBe(true);
    });
  });

  describe("consultas", () => {
    it("precioMinimo y entradasDisponibles se calculan con los tipos de entrada", () => {
      const evento = new Evento(datosValidos());
      evento.tiposEntrada[0].reservar(20);

      expect(evento.precioMinimo).toBe(10000);
      expect(evento.entradasDisponibles).toBe(90);
    });

    it("yaSeRealizo compara la fecha con el momento indicado", () => {
      const evento = new Evento(datosValidos());

      expect(evento.yaSeRealizo(new Date("2026-12-01"))).toBe(false);
      expect(evento.yaSeRealizo(new Date("2026-12-11"))).toBe(true);
    });

    it("coincideCon busca en nombre, descripción y categoría sin importar mayúsculas ni tildes", () => {
      const evento = new Evento(datosValidos());

      expect(evento.coincideCon("JAZZ")).toBe(true);
      expect(evento.coincideCon("centro cultural")).toBe(true);
      expect(evento.coincideCon("musica")).toBe(true);
      expect(evento.coincideCon("teatro")).toBe(false);
    });

    it("buscarTipoEntrada encuentra el tipo por su id, aunque llegue como texto", () => {
      const evento = new Evento(datosValidos());

      expect(evento.buscarTipoEntrada("2").nombre).toBe("VIP");
      expect(evento.buscarTipoEntrada(3)).toBeUndefined();
    });

    it("esOrganizadoPor compara por id de usuario", () => {
      const evento = new Evento(datosValidos());

      expect(evento.esOrganizadoPor({ id: 1 })).toBe(true);
      expect(evento.esOrganizadoPor({ id: 2 })).toBe(false);
    });
  });
});
