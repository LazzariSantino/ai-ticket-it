import { Router } from "express";

export function crearCategoriaRouter(categoriaController) {
  const router = Router();
  router.get("/", (req, res) => categoriaController.listarCategorias(req, res));

  return router;
}
