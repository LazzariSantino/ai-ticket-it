import { Categoria } from "../../domain/Categoria.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

describe("Dominio: Categoria", () => {
  it("error si no tiene nombre", () => {
    expect(() => new Categoria({ nombre: "  " })).toThrow(UnprocessableEntityError);
  });

  it("crea una categoría con nombre y descripción", () => {
    const categoria = new Categoria({ nombre: "Recitales", descripcion: "Música en vivo" });

    expect(categoria.nombre).toBe("Recitales");
    expect(categoria.descripcion).toBe("Música en vivo");
  });
});
