import { validarCamposRequeridos } from "./validaciones.js";

export class ImagenController {
  constructor(imagenService) {
    this.imagenService = imagenService;
  }

  // Devuelve la ruta relativa: la app le agrega la dirección del servidor, que cambia según la red
  async subir(req, res) {
    validarCamposRequeridos(req.body, ["tipo", "datos"]);
    const imagen = await this.imagenService.subir(req.usuario, { tipo: req.body.tipo, datos: req.body.datos });
    return res.status(201).json({ id: imagen.id, url: imagen.url });
  }

  async obtener(req, res) {
    const imagen = await this.imagenService.obtener(req.params.id);
    res.set("Content-Type", imagen.tipo);
    // Que el navegador respete el tipo y no intente adivinarlo
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "public, max-age=86400");
    return res.status(200).send(imagen.datos);
  }
}
