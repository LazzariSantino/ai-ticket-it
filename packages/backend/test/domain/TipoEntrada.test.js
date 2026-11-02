import { TipoEntrada } from "../../domain/TipoEntrada.js";

describe("Dominio: TipoEntrada", () => {
  const datosValidos = { nombre: "Platea", descripcion: "Sector sentado", precio: 15000, cupo: 10 };

  describe("Constructor", () => {
    it("error si falta el nombre", () => {
      expect(() => new TipoEntrada({ ...datosValidos, nombre: "" })).toThrow("El tipo de entrada debe tener un nombre");
    });

    it("error si el precio es negativo o no es un número", () => {
      expect(() => new TipoEntrada({ ...datosValidos, precio: -1 })).toThrow("debe ser un número mayor o igual a 0");
      expect(() => new TipoEntrada({ ...datosValidos, precio: "100" })).toThrow("debe ser un número mayor o igual a 0");
    });

    it("error si el cupo no es un entero mayor a 0", () => {
      expect(() => new TipoEntrada({ ...datosValidos, cupo: 0 })).toThrow("debe ser un número entero mayor a 0");
      expect(() => new TipoEntrada({ ...datosValidos, cupo: 2.5 })).toThrow("debe ser un número entero mayor a 0");
    });

    it("permite entradas gratuitas", () => {
      expect(new TipoEntrada({ ...datosValidos, precio: 0 }).precio).toBe(0);
    });

    it("arranca con todo el cupo disponible", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.cupo).toBe(10);
      expect(tipo.cupoTotal).toBe(10);
      expect(tipo.vendidas).toBe(0);
    });
  });

  describe("hayCupoPara", () => {
    it("es verdadero mientras la cantidad no supere el cupo disponible", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(tipo.hayCupoPara(10)).toBe(true);
      expect(tipo.hayCupoPara(11)).toBe(false);
    });
  });

  describe("reservar y liberar", () => {
    it("reservar descuenta del cupo disponible", () => {
      const tipo = new TipoEntrada(datosValidos);

      tipo.reservar(4);

      expect(tipo.cupo).toBe(6);
      expect(tipo.vendidas).toBe(4);
    });

    it("reservar falla si no alcanza el cupo y no descuenta nada", () => {
      const tipo = new TipoEntrada(datosValidos);

      expect(() => tipo.reservar(11)).toThrow("No hay cupo suficiente para 11 entradas Platea: quedan 10");
      expect(tipo.cupo).toBe(10);
    });

    it("liberar devuelve el cupo sin pasarse del total", () => {
      const tipo = new TipoEntrada(datosValidos);
      tipo.reservar(3);

      tipo.liberar(3);
      tipo.liberar(5);

      expect(tipo.cupo).toBe(10);
    });
  });
});
