import request from "supertest";
import { crearApp } from "../../app.js";

// Un PNG de 1x1 píxel, suficiente para probar la subida y la descarga
const PNG_1X1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("API: /imagenes", () => {
  let app;
  let usuario;

  beforeEach(async () => {
    app = await crearApp();
    const { body } = await request(app)
      .post("/auth/registro")
      .send({ nombre: "Ana", apellido: "Test", email: "ana@mail.com", contrasenia: "secreta1" });
    usuario = `Bearer ${body.token}`;
  });

  it("POST /imagenes guarda la foto y GET la devuelve con su tipo", async () => {
    const subida = await request(app)
      .post("/imagenes")
      .set("Authorization", usuario)
      .send({ tipo: "image/png", datos: PNG_1X1 });

    expect(subida.status).toBe(201);
    expect(subida.body).toEqual({ id: expect.any(Number), url: `/imagenes/${subida.body.id}` });

    const descarga = await request(app).get(subida.body.url);

    expect(descarga.status).toBe(200);
    expect(descarga.headers["content-type"]).toBe("image/png");
    expect(descarga.headers["x-content-type-options"]).toBe("nosniff");
    expect(Buffer.compare(descarga.body, Buffer.from(PNG_1X1, "base64"))).toBe(0);
  });

  it("POST /imagenes acepta una foto grande (más que el límite común de JSON)", async () => {
    const grande = Buffer.alloc(2 * 1024 * 1024, 1).toString("base64");

    const subida = await request(app)
      .post("/imagenes")
      .set("Authorization", usuario)
      .send({ tipo: "image/jpeg", datos: grande });

    expect(subida.status).toBe(201);
  });

  it("POST /imagenes pide sesión, valida los campos y sólo acepta imágenes", async () => {
    const sinSesion = await request(app).post("/imagenes").send({ tipo: "image/png", datos: PNG_1X1 });
    const sinDatos = await request(app).post("/imagenes").set("Authorization", usuario).send({ tipo: "image/png" });
    const noEsImagen = await request(app)
      .post("/imagenes")
      .set("Authorization", usuario)
      .send({ tipo: "text/html", datos: Buffer.from("<script>alert(1)</script>").toString("base64") });

    expect(sinSesion.status).toBe(401);
    expect(sinDatos.status).toBe(400);
    expect(noEsImagen.status).toBe(422);
  });

  it("POST /imagenes rechaza fotos de más de 8 MB y GET responde 404 si no existe", async () => {
    const enorme = Buffer.alloc(9 * 1024 * 1024, 1).toString("base64");

    const subida = await request(app)
      .post("/imagenes")
      .set("Authorization", usuario)
      .send({ tipo: "image/jpeg", datos: enorme });
    const inexistente = await request(app).get("/imagenes/999");

    expect([413, 422]).toContain(subida.status);
    expect(inexistente.status).toBe(404);
  });
});
