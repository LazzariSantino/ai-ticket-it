import { randomUUID } from "node:crypto";
import { Usuario } from "../domain/Usuario.js";
import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

// Cuánto dura una sesión desde el login. Después hay que volver a iniciar sesión.
export const DURACION_SESION_HORAS = 12;

export class AuthService {
  constructor(usuarioRepository, sesionRepository, reloj = () => new Date()) {
    this._usuarioRepository = usuarioRepository;
    this._sesionRepository = sesionRepository;
    this._reloj = reloj;
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
    const sesion = token ? await this._sesionRepository.buscar(token) : null;
    if (!sesion) {
      throw new UnauthorizedError("La sesión no es válida, volvé a iniciar sesión");
    }
    if (sesion.venceEl <= this._reloj()) {
      await this._sesionRepository.eliminar(token);
      throw new UnauthorizedError("La sesión expiró, volvé a iniciar sesión");
    }
    return sesion.usuario;
  }

  async _iniciarSesion(usuario) {
    const ahora = this._reloj();
    await this._sesionRepository.eliminarVencidas(ahora);
    const token = randomUUID();
    const venceEl = new Date(ahora.getTime() + DURACION_SESION_HORAS * 60 * 60 * 1000);
    await this._sesionRepository.guardar(token, usuario, venceEl);
    return { token, usuario };
  }
}
