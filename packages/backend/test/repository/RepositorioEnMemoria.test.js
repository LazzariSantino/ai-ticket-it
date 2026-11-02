import { RepositorioEnMemoria } from "../../repository/RepositorioEnMemoria.js";
import { ReseniaRepository } from "../../repository/Resenia.repository.js";

describe("Repositorio en memoria", () => {
  let repositorio;

  beforeEach(() => {
    repositorio = new RepositorioEnMemoria();
  });

  it("guardar asigna ids incrementales a los elementos nuevos", async () => {
    const primero = await repositorio.guardar({ nombre: "a" });
    const segundo = await repositorio.guardar({ nombre: "b" });

    expect(primero.id).toBe(1);
    expect(segundo.id).toBe(2);
  });

  it("guardar un elemento que ya tiene id no lo duplica", async () => {
    const elemento = await repositorio.guardar({ nombre: "a" });
    elemento.nombre = "cambiado";

    await repositorio.guardar(elemento);

    expect(await repositorio.buscarTodos()).toHaveLength(1);
  });

  it("buscarPorId acepta el id como texto y devuelve null si no existe", async () => {
    await repositorio.guardar({ nombre: "a" });

    expect((await repositorio.buscarPorId("1")).nombre).toBe("a");
    expect(await repositorio.buscarPorId(99)).toBeNull();
  });

  it("buscarTodos devuelve una copia de la lista", async () => {
    await repositorio.guardar({ nombre: "a" });

    (await repositorio.buscarTodos()).pop();

    expect(await repositorio.buscarTodos()).toHaveLength(1);
  });

  it("las reseñas de un organizador vienen de la más nueva a la más vieja", async () => {
    const resenias = new ReseniaRepository();
    const evento = { organizador: { id: 1 } };
    await resenias.guardar({ evento, fecha: new Date("2026-01-01"), detalle: "vieja" });
    await resenias.guardar({ evento, fecha: new Date("2026-06-01"), detalle: "nueva" });
    await resenias.guardar({ evento: { organizador: { id: 2 } }, fecha: new Date(), detalle: "de otro" });

    const deOrganizador = await resenias.buscarPorOrganizador(1);

    expect(deOrganizador.map((r) => r.detalle)).toEqual(["nueva", "vieja"]);
  });
});
