import request from "supertest";
import { crearApp } from "../../app.js";
import { datosDeEvento } from "../helpers.js";

describe("API: /eventos", () => {
  const ahora = new Date("2026-11-01T12:00:00.000Z");
  let app;
  let auth;

  beforeEach(async () => {
    app = await crearApp({ reloj: () => ahora });
    const { body } = await request(app)
      .post("/auth/registro")
      .send({ nombre: "Ana", apellido: "Organiza", email: "ana@mail.com", contrasenia: "secreta1" });
    auth = `Bearer ${body.token}`;
  });

  it("responde 401 sin sesión", async () => {
    expect((await request(app).get("/eventos")).status).toBe(401);
  });

  it("POST /eventos crea el evento y GET /eventos lo encuentra por texto", async () => {
    const creado = await request(app).post("/eventos").set("Authorization", auth).send(datosDeEvento(1));

    const busqueda = await request(app).get("/eventos?q=jazz&orden=precio").set("Authorization", auth);

    expect(creado.status).toBe(201);
    expect(busqueda.status).toBe(200);
    expect(busqueda.body.map((evento) => evento.id)).toEqual([creado.body.id]);
  });

  it("POST /eventos responde 400 si faltan campos y 422 si rompe una regla", async () => {
    const sinCampos = await request(app).post("/eventos").set("Authorization", auth).send({ nombre: "x" });
    const sinCupo = await request(app)
      .post("/eventos")
      .set("Authorization", auth)
      .send(datosDeEvento(1, { tiposEntrada: [{ nombre: "General", precio: 100, cupo: 0 }] }));

    expect(sinCampos.status).toBe(400);
    expect(sinCupo.status).toBe(422);
  });

  it("GET /eventos responde 400 si un filtro numérico no es un número", async () => {
    const respuesta = await request(app).get("/eventos?precioMinimo=barato").set("Authorization", auth);

    expect(respuesta.status).toBe(400);
  });

  it("GET /eventos/:id responde 404 si no existe", async () => {
    expect((await request(app).get("/eventos/99").set("Authorization", auth)).status).toBe(404);
  });

  it("PUT y DELETE /eventos/:id/favorito actualizan los favoritos del usuario", async () => {
    const { body: evento } = await request(app).post("/eventos").set("Authorization", auth).send(datosDeEvento(1));

    const agregado = await request(app).put(`/eventos/${evento.id}/favorito`).set("Authorization", auth);
    const favoritos = await request(app).get("/eventos/favoritos").set("Authorization", auth);
    const quitado = await request(app).delete(`/eventos/${evento.id}/favorito`).set("Authorization", auth);

    expect(agregado.body.favoritos).toEqual([evento.id]);
    expect(favoritos.body).toHaveLength(1);
    expect(quitado.body.favoritos).toEqual([]);
  });

  it("GET /eventos/mios lista los eventos del organizador", async () => {
    await request(app).post("/eventos").set("Authorization", auth).send(datosDeEvento(1));

    const respuesta = await request(app).get("/eventos/mios").set("Authorization", auth);

    expect(respuesta.body).toHaveLength(1);
  });
});
