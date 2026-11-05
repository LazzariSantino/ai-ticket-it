import { AuthService } from "../../services/Auth.service.js";
import { UsuarioRepository } from "../../repository/Usuario.repository.js";
import { SesionRepository } from "../../repository/Sesion.repository.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { UnauthorizedError } from "../../errors/UnauthorizedError.js";

describe("AuthService", () => {
  const datos = { nombre: "Juan", apellido: "Pérez", email: "juan@mail.com", contrasenia: "secreta1" };
  let service;

  beforeEach(() => {
    service = new AuthService(new UsuarioRepository(), new SesionRepository());
  });

  it("registrar crea el usuario y deja la sesión iniciada", async () => {
    const { token, usuario } = await service.registrar(datos);

    expect(usuario.id).toBe(1);
    expect(await service.usuarioDeToken(token)).toBe(usuario);
  });

  it("registrar falla si el email ya está registrado, sin importar mayúsculas", async () => {
    await service.registrar(datos);

    await expect(service.registrar({ ...datos, email: "JUAN@mail.com" })).rejects.toThrow(ConflictError);
  });

  it("login devuelve un token nuevo con las credenciales correctas", async () => {
    const registro = await service.registrar(datos);

    const login = await service.login({ email: "Juan@Mail.com", contrasenia: "secreta1" });

    expect(login.token).not.toBe(registro.token);
    expect(login.usuario).toBe(registro.usuario);
  });

  it("login falla con el mismo mensaje si el email no existe o la contraseña es incorrecta", async () => {
    await service.registrar(datos);

    await expect(service.login({ email: "otro@mail.com", contrasenia: "secreta1" })).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
    await expect(service.login({ email: "juan@mail.com", contrasenia: "mal" })).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
  });

  it("logout invalida el token", async () => {
    const { token } = await service.registrar(datos);

    await service.logout(token);

    await expect(service.usuarioDeToken(token)).rejects.toThrow(UnauthorizedError);
  });

  it("la sesión vence a las 12 horas y hay que volver a iniciar sesión", async () => {
    let ahora = new Date("2026-11-01T10:00:00.000Z");
    const conReloj = new AuthService(new UsuarioRepository(), new SesionRepository(), () => ahora);
    const { token } = await conReloj.registrar(datos);

    ahora = new Date("2026-11-01T21:59:00.000Z");
    await expect(conReloj.usuarioDeToken(token)).resolves.toBeDefined();
    ahora = new Date("2026-11-01T22:00:00.000Z");
    await expect(conReloj.usuarioDeToken(token)).rejects.toThrow("La sesión expiró, volvé a iniciar sesión");
  });

  it("al iniciar sesión se borran de la memoria las sesiones vencidas", async () => {
    let ahora = new Date("2026-11-01T10:00:00.000Z");
    const sesiones = new SesionRepository();
    const conReloj = new AuthService(new UsuarioRepository(), sesiones, () => ahora);
    await conReloj.registrar(datos);
    await conReloj.login({ email: datos.email, contrasenia: datos.contrasenia });

    ahora = new Date("2026-11-02T10:00:00.000Z");
    await conReloj.login({ email: datos.email, contrasenia: datos.contrasenia });

    expect(sesiones.sesiones.size).toBe(1);
  });

  it("usuarioDeToken falla si no hay token", async () => {
    await expect(service.usuarioDeToken(undefined)).rejects.toThrow(UnauthorizedError);
  });
});
