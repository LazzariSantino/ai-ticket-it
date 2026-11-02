import request from "supertest";
import { crearApp } from "../../app.js";
import { datosDeEvento } from "../helpers.js";

describe("API: /compras", () => {
  let ahora;
  let app;
  let organizadora;
  let compradora;
  let evento;

  async function registrar(nombre) {
    const { body } = await request(app)
      .post("/auth/registro")
      .send({ nombre, apellido: "Test", email: `${nombre}@mail.com`, contrasenia: "secreta1" });
    return `Bearer ${body.token}`;
  }

  beforeEach(async () => {
    ahora = new Date("2026-11-01T12:00:00.000Z");
    app = await crearApp({ reloj: () => ahora });
    organizadora = await registrar("orga");
    compradora = await registrar("compradora");
    evento = (await request(app).post("/eventos").set("Authorization", organizadora).send(datosDeEvento(1))).body;
  });

  const comprar = (cantidad = 2) =>
    request(app)
      .post("/compras")
      .set("Authorization", compradora)
      .send({ eventoId: evento.id, tipoEntradaId: 1, cantidad });

  it("POST /compras crea una compra pendiente", async () => {
    const respuesta = await comprar();

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({
      estado: "PENDIENTE",
      cantidad: 2,
      total: 20000,
      diasParaEvento: null,
      puedeCancelarse: true,
      tipoEntrada: { id: 1, nombre: "General" },
    });
  });

  it("POST /compras responde 400 si faltan campos y 422 si se supera el cupo", async () => {
    const sinCampos = await request(app).post("/compras").set("Authorization", compradora).send({});
    const sinCupo = await comprar(101);

    expect(sinCampos.status).toBe(400);
    expect(sinCupo.status).toBe(422);
  });

  it("GET /compras lista las compras del usuario logueado", async () => {
    await comprar();

    const propias = await request(app).get("/compras").set("Authorization", compradora);
    const deOtra = await request(app).get("/compras").set("Authorization", organizadora);

    expect(propias.body).toHaveLength(1);
    expect(deOtra.body).toHaveLength(0);
  });

  it("GET /eventos/:id/compras sólo lo puede ver el organizador", async () => {
    await comprar();

    const organizador = await request(app).get(`/eventos/${evento.id}/compras`).set("Authorization", organizadora);
    const comprador = await request(app).get(`/eventos/${evento.id}/compras`).set("Authorization", compradora);

    expect(organizador.status).toBe(200);
    expect(organizador.body.cantidadPorEstado.PENDIENTE).toBe(1);
    expect(organizador.body.tiposEntrada[0].cupoDisponible).toBe(98);
    expect(comprador.status).toBe(403);
  });
});
