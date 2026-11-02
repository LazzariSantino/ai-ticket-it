import { randomUUID } from "node:crypto";
import { Usuario } from "../domain/Usuario.js";
import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export class AuthService {
  constructor(usuarioRepository, sesionRepository) {
    this._usuarioRepository = usuarioRepository;
    this._sesionRepository = sesionRepository;
  }

  async registrar({ nombre, apellido, email, contrasenia }) {
    const usuario = Usuario.registrar({ nombre, apellido, email, contrasenia });

    if (await this._usuarioRepository.buscarPorEmail(usuario.email)) {
      throw new ConflictError(`Ya existe un usuario con el email ${usuario.email}`);
    }

    await this._usuarioRepository.guardar(usuario);
    return await this._iniciarSesion(usuario);
  }

  // El mensaje es el mismo si no existe el email o si la contraseña está mal, para no revelar qué usuarios hay
  async login({ email, contrasenia }) {
    const usuario = await this._usuarioRepository.buscarPorEmail(Usuario.normalizarEmail(email));
    if (!usuario || !usuario.verificarContrasenia(contrasenia)) {
      throw new UnauthorizedError("Email o contraseña incorrectos");
    }
    return await this._iniciarSesion(usuario);
  }

  async logout(token) {
    await this._sesionRepository.eliminar(token);
  }

  async usuarioDeToken(token) {
    const usuario = token ? await this._sesionRepository.buscarUsuario(token) : null;
    if (!usuario) {
      throw new UnauthorizedError("La sesión no es válida o expiró, volvé a iniciar sesión");
    }
    return usuario;
  }

  async _iniciarSesion(usuario) {
    const token = randomUUID();
    await this._sesionRepository.guardar(token, usuario);
    return { token, usuario };
  }
}
