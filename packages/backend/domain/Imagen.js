import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";

export const TIPOS_DE_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const TAMANIO_MAXIMO_BYTES = 8 * 1024 * 1024;

// Una foto subida desde la app (por ejemplo, la de un evento). Se guarda en memoria como el resto de los datos.
export class Imagen {
  constructor({ tipo, datos, subidaPor }) {
    // Sólo tipos de imagen: así nunca se sirve HTML o JavaScript con el tipo que eligió quien subió el archivo
    if (!TIPOS_DE_IMAGEN.includes(tipo)) {
      throw new UnprocessableEntityError(
        `El tipo ${tipo} no es una imagen válida. Opciones: ${TIPOS_DE_IMAGEN.join(", ")}`,
      );
    }
    if (!Buffer.isBuffer(datos) || datos.length === 0) {
      throw new UnprocessableEntityError("La imagen está vacía");
    }
    if (datos.length > TAMANIO_MAXIMO_BYTES) {
      throw new UnprocessableEntityError("La imagen no puede pesar más de 8 MB");
    }
    this.tipo = tipo;
    this.datos = datos;
    this.subidaPor = subidaPor;
  }

  // La app manda la foto en base64 dentro del JSON
  static desdeBase64({ tipo, base64, subidaPor }) {
    if (typeof base64 !== "string") {
      throw new UnprocessableEntityError("La imagen tiene que venir en base64");
    }
    return new Imagen({ tipo, datos: Buffer.from(base64, "base64"), subidaPor });
  }

  get url() {
    return `/imagenes/${this.id}`;
  }
}
