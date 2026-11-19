import { Imagen } from "../domain/Imagen.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export class ImagenService {
  constructor(imagenRepository) {
    this._imagenRepository = imagenRepository;
  }

  async subir(usuario, { tipo, datos }) {
    return await this._imagenRepository.guardar(Imagen.desdeBase64({ tipo, base64: datos, subidaPor: usuario }));
  }

  async obtener(id) {
    const imagen = await this._imagenRepository.buscarPorId(id);
    if (!imagen) {
      throw new NotFoundError(`La imagen con id ${id} no existe`);
    }
    return imagen;
  }
}
