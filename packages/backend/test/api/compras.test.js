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

  it("la respuesta usa el reloj de la aplicación y no la fecha real de la computadora", async () => {
    const { body: compra } = await comprar();
    await request(app).post(`/compras/${compra.id}/pago`).set("Authorization", compradora);

    const antes = await request(app).get(`/compras/${compra.id}`).set("Authorization", compradora);
    ahora = new Date("2026-12-11T12:00:00.000Z");
    const despues = await request(app).get(`/compras/${compra.id}`).set("Authorization", compradora);

    expect(antes.body).toMatchObject({ puedeCancelarse: true, diasParaEvento: expect.any(Number) });
    expect(despues.body).toMatchObject({ puedeCancelarse: false, diasParaEvento: null });
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

  it("recorre el flujo pagar → utilizar, con el historial de cambios de estado", async () => {
    const { body: compra } = await comprar();

    const pago = await request(app).post(`/compras/${compra.id}/pago`).set("Authorization", compradora);
    ahora = new Date("2026-12-10T22:00:00.000Z");
    const uso = await request(app).post(`/compras/${compra.id}/uso`).set("Authorization", organizadora);

    expect(pago.status).toBe(200);
    expect(pago.body.estado).toBe("CONFIRMADA");
    expect(uso.body.estado).toBe("UTILIZADA");
    expect(uso.body.historial.map((cambio) => [cambio.estado, cambio.quien.nombre])).toEqual([
      ["PENDIENTE", "compradora"],
      ["CONFIRMADA", "compradora"],
      ["UTILIZADA", "orga"],
    ]);
  });

  it("POST /compras/:id/cancelacion reembolsa una compra pagada y responde 422 si se repite", async () => {
    const { body: compra } = await comprar();
    await request(app).post(`/compras/${compra.id}/pago`).set("Authorization", compradora);

    const cancelacion = await request(app).post(`/compras/${compra.id}/cancelacion`).set("Authorization", compradora);
    const otraVez = await request(app).post(`/compras/${compra.id}/cancelacion`).set("Authorization", compradora);

    expect(cancelacion.body.estado).toBe("REEMBOLSADA");
    expect(otraVez.status).toBe(422);
  });

  it("GET /compras/:id/mensajes?desde=N devuelve sólo los mensajes nuevos", async () => {
    const { body: compra } = await comprar();
    for (const mensaje of ["uno", "dos", "tres"]) {
      await request(app).post(`/compras/${compra.id}/mensajes`).set("Authorization", compradora).send({ mensaje });
    }

    const nuevos = await request(app).get(`/compras/${compra.id}/mensajes?desde=2`).set("Authorization", compradora);
    const invalido = await request(app).get(`/compras/${compra.id}/mensajes?desde=-1`).set("Authorization", compradora);

    expect(nuevos.body.map((m) => m.mensaje)).toEqual(["tres"]);
    expect(invalido.status).toBe(400);
  });

  it("GET /compras/chats lista los chats del usuario, con el último mensaje y el más reciente primero", async () => {
    const { body: sinMensajes } = await comprar(1);
    const { body: primera } = await comprar(1);
    const { body: segunda } = await comprar(1);
    const escribir = (compra, auth, mensaje) =>
      request(app).post(`/compras/${compra.id}/mensajes`).set("Authorization", auth).send({ mensaje });
    await escribir(primera, compradora, "¿Hay guardarropa?");
    ahora = new Date("2026-11-01T13:00:00.000Z");
    await escribir(segunda, compradora, "¿Se puede entrar con cámara?");
    ahora = new Date("2026-11-01T14:00:00.000Z");
    await escribir(primera, organizadora, "Sí, en la entrada");

    const deLaCompradora = await request(app).get("/compras/chats").set("Authorization", compradora);
    const deLaOrganizadora = await request(app).get("/compras/chats").set("Authorization", organizadora);
    const deOtro = await request(app)
      .get("/compras/chats")
      .set("Authorization", await registrar("otro"));

    expect(deLaCompradora.status).toBe(200);
    expect(deLaCompradora.body.map((compra) => compra.id)).toEqual([primera.id, segunda.id]);
    expect(deLaCompradora.body[0].ultimoMensaje).toMatchObject({ mensaje: "Sí, en la entrada" });
    expect(deLaOrganizadora.body.map((compra) => compra.id)).toEqual([primera.id, segunda.id]);
    expect(deLaCompradora.body.map((compra) => compra.id)).not.toContain(sinMensajes.id);
    expect(deOtro.body).toEqual([]);
  });

  it("GET /compras/chats dice cuántos mensajes no leyó cada uno, y abrir el chat los marca como leídos", async () => {
    const { body: compra } = await comprar(1);
    const chatsDe = async (auth) => (await request(app).get("/compras/chats").set("Authorization", auth)).body;
    await request(app)
      .post(`/compras/${compra.id}/mensajes`)
      .set("Authorization", compradora)
      .send({ mensaje: "¿Hay guardarropa?" });

    expect((await chatsDe(organizadora))[0].mensajesSinLeer).toBe(1);
    expect((await chatsDe(compradora))[0].mensajesSinLeer).toBe(0);

    await request(app).get(`/compras/${compra.id}/mensajes`).set("Authorization", organizadora);

    expect((await chatsDe(organizadora))[0].mensajesSinLeer).toBe(0);
  });

  it("comprador y organizador chatean dentro de la compra, aun cancelada", async () => {
    const { body: compra } = await comprar();
    await request(app).post(`/compras/${compra.id}/cancelacion`).set("Authorization", compradora);
    const intruso = await registrar("intruso");

    const pregunta = await request(app)
      .post(`/compras/${compra.id}/mensajes`)
      .set("Authorization", compradora)
      .send({ mensaje: "¿Cuándo vuelve a haber función?" });
    await request(app)
      .post(`/compras/${compra.id}/mensajes`)
      .set("Authorization", organizadora)
      .send({ mensaje: "En marzo" });
    const chat = await request(app).get(`/compras/${compra.id}/mensajes`).set("Authorization", compradora);
    const ajeno = await request(app).get(`/compras/${compra.id}/mensajes`).set("Authorization", intruso);
    const vacio = await request(app)
      .post(`/compras/${compra.id}/mensajes`)
      .set("Authorization", compradora)
      .send({ mensaje: "" });

    expect(pregunta.status).toBe(201);
    expect(chat.body.map((m) => [m.usuario.nombre, m.mensaje])).toEqual([
      ["compradora", "¿Cuándo vuelve a haber función?"],
      ["orga", "En marzo"],
    ]);
    expect(ajeno.status).toBe(403);
    expect(vacio.status).toBe(400);
  });

  it("después de utilizar la entrada se puede reseñar y la reseña aparece en los eventos del organizador", async () => {
    const { body: compra } = await comprar();
    const reseniaAntes = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set("Authorization", compradora)
      .send({ puntuacion: 5, detalle: "Impecable" });
    await request(app).post(`/compras/${compra.id}/pago`).set("Authorization", compradora);
    ahora = new Date("2026-12-10T22:00:00.000Z");
    await request(app).post(`/compras/${compra.id}/uso`).set("Authorization", organizadora);

    const resenia = await request(app)
      .post(`/compras/${compra.id}/resenia`)
      .set("Authorization", compradora)
      .send({ puntuacion: 4, detalle: "Muy buen show" });
    const detalle = await request(app).get(`/eventos/${evento.id}`).set("Authorization", compradora);

    expect(reseniaAntes.status).toBe(422);
    expect(resenia.status).toBe(201);
    expect(detalle.body.organizador.puntaje).toBe(4);
    expect(detalle.body.reseniasDelOrganizador.map((r) => r.detalle)).toEqual(["Muy buen show"]);
  });

  it("POST /compras/:id/uso responde 403 si no lo hace el organizador", async () => {
    const { body: compra } = await comprar();

    const respuesta = await request(app).post(`/compras/${compra.id}/uso`).set("Authorization", compradora);

    expect(respuesta.status).toBe(403);
  });
});
