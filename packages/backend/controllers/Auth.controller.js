import { validarCamposRequeridos } from "./validaciones.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async registrar(req, res) {
    validarCamposRequeridos(req.body, ["nombre", "apellido", "email", "contrasenia"]);
    const { nombre, apellido, email, contrasenia } = req.body;

    const sesion = await this.authService.registrar({ nombre, apellido, email, contrasenia });
    return res.status(201).json(sesion);
  }

  async login(req, res) {
    validarCamposRequeridos(req.body, ["email", "contrasenia"]);
    const { email, contrasenia } = req.body;

    const sesion = await this.authService.login({ email, contrasenia });
    return res.status(200).json(sesion);
  }

  async logout(req, res) {
    await this.authService.logout(req.token);
    return res.status(204).send();
  }

  async usuarioActual(req, res) {
    return res.status(200).json(req.usuario);
  }
}
