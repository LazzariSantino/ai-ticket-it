import request from "supertest";
import { crearApp } from "../../app.js";
import { CONTRASENIA_DE_PRUEBA } from "../../seed/datosDePrueba.js";

describe("Datos de prueba", () => {
  let app;

  async function login(email) {
    const { body } = await request(app).post("/auth/login").send({ email, contrasenia: CONTRASENIA_DE_PRUEBA });
    return `Bearer ${body.token}`;
  }

  beforeEach(async () => {
    app = await crearApp({ conDatosDePrueba: true });
  });

  it("la compradora tiene compras en todos los estados", async () => {
    const compras = await request(app)
      .get("/compras")
      .set("Authorization", await login("comprador@aiticketit.com"));

    const estados = new Set(compras.body.map((compra) => compra.estado));
    expect([...estados].sort()).toEqual(["CANCELADA", "CONFIRMADA", "PENDIENTE", "REEMBOLSADA", "UTILIZADA"]);
    expect(compras.body.some((compra) => compra.puedeSerReseniada)).toBe(true);
  });

  it("los organizadores tienen reputación por las reseñas de sus eventos pasados", async () => {
    const eventos = await request(app)
      .get("/eventos?orden=puntaje")
      .set("Authorization", await login("comprador@aiticketit.com"));

    expect(eventos.body[0].organizador).toMatchObject({ nombre: "Martín", puntaje: 4.5, cantidadResenias: 2 });
    expect(eventos.body.map((evento) => evento.nombre)).not.toContain("Tango bajo las estrellas");
  });

  it("el organizador puede validar hoy las entradas del stand up", async () => {
    const organizador = await login("organizador@aiticketit.com");
    const misEventos = await request(app).get("/eventos/mios").set("Authorization", organizador);
    const standUp = misEventos.body.find((evento) => evento.nombre.startsWith("Stand up"));
    const { body } = await request(app).get(`/eventos/${standUp.id}/compras`).set("Authorization", organizador);

    const uso = await request(app).post(`/compras/${body.compras[0].id}/uso`).set("Authorization", organizador);

    expect(uso.status).toBe(200);
    expect(uso.body.estado).toBe("UTILIZADA");
  });
});
