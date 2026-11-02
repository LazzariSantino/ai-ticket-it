import request from "supertest";
import { crearApp } from "../../app.js";

describe("API: /categorias", () => {
  it("GET /categorias devuelve el catálogo inicial", async () => {
    const respuesta = await request(await crearApp()).get("/categorias");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.map((categoria) => categoria.nombre)).toContain("Recitales");
    expect(respuesta.body[0]).toEqual({ id: 1, nombre: "Recitales", descripcion: expect.any(String) });
  });
});
