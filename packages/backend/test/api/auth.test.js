import request from "supertest";
import { crearApp } from "../../app.js";

describe("API: /auth", () => {
  const datos = { nombre: "Juan", apellido: "Pérez", email: "juan@mail.com", contrasenia: "secreta1" };
  let app;

  beforeEach(async () => {
    app = await crearApp();
  });

  it("POST /auth/registro responde 201 con token y usuario sin contraseña", async () => {
    const respuesta = await request(app).post("/auth/registro").send(datos);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toEqual(expect.any(String));
    expect(respuesta.body.usuario).toEqual({
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@mail.com",
      favoritos: [],
    });
  });

  it("POST /auth/registro responde 400 si faltan campos", async () => {
    const respuesta = await request(app).post("/auth/registro").send({ email: "juan@mail.com" });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.message).toBe("Faltan campos requeridos: nombre, apellido, contrasenia");
  });

  it("POST /auth/login responde 401 con credenciales incorrectas", async () => {
    await request(app).post("/auth/registro").send(datos);

    const respuesta = await request(app).post("/auth/login").send({ email: datos.email, contrasenia: "otra123" });

    expect(respuesta.status).toBe(401);
  });

  it("GET /auth/yo devuelve el usuario del token y 401 sin token", async () => {
    const { body } = await request(app).post("/auth/registro").send(datos);

    const conToken = await request(app).get("/auth/yo").set("Authorization", `Bearer ${body.token}`);
    const sinToken = await request(app).get("/auth/yo");

    expect(conToken.status).toBe(200);
    expect(conToken.body.email).toBe("juan@mail.com");
    expect(sinToken.status).toBe(401);
  });

  it("POST /auth/logout invalida el token", async () => {
    const { body } = await request(app).post("/auth/registro").send(datos);
    const auth = `Bearer ${body.token}`;

    const logout = await request(app).post("/auth/logout").set("Authorization", auth);
    const despues = await request(app).get("/auth/yo").set("Authorization", auth);

    expect(logout.status).toBe(204);
    expect(despues.status).toBe(401);
  });
});
