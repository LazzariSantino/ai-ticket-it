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

  it("usuarioDeToken falla si no hay token", async () => {
    await expect(service.usuarioDeToken(undefined)).rejects.toThrow(UnauthorizedError);
  });
});
