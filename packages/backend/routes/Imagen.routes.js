import { Router } from "express";

export function crearImagenRouter(imagenController, autenticar) {
  const router = Router();

  // Ver una imagen es público: la app la muestra con <Image>, que no manda el token
  router.get("/:id", (req, res) => imagenController.obtener(req, res));
  router.post("/", autenticar, (req, res) => imagenController.subir(req, res));

  return router;
}
