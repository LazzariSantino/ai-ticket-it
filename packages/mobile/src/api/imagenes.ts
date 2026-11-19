import { pedir } from "./cliente";

// Sube una foto (en base64) y devuelve la ruta con la que queda guardada en el servidor
export const subirImagen = (datos: string, tipo: string) =>
  pedir<{ id: number; url: string }>("/imagenes", { metodo: "POST", body: { datos, tipo } });
