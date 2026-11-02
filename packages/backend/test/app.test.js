import request from "supertest";
import { crearApp } from "../app.js";

describe("App", () => {
  it("GET /health responde ok", async () => {
    const respuesta = await request(crearApp()).get("/health");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.status).toBe("ok");
  });

  it("GET /api-docs.json devuelve la especificación OpenAPI", async () => {
    const respuesta = await request(crearApp()).get("/api-docs.json");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.openapi).toBe("3.0.3");
    expect(respuesta.body.paths["/health"]).toBeDefined();
  });

  it("responde 400 si el body no es un JSON válido", async () => {
    const respuesta = await request(crearApp())
      .post("/health")
      .set("Content-Type", "application/json")
      .send("{ esto no es json");

    expect(respuesta.status).toBe(400);
  });
});
