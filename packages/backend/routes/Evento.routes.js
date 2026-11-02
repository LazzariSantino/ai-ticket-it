import { Router } from "express";

export function crearEventoRouter(eventoController, autenticar) {
  const router = Router();
  router.use(autenticar);

  router.get("/", (req, res) => eventoController.buscarEventos(req, res));
  router.post("/", (req, res) => eventoController.crearEvento(req, res));
  // Van antes de "/:id" para que "mios" y "favoritos" no se tomen como un id
  router.get("/mios", (req, res) => eventoController.listarMisEventos(req, res));
  router.get("/favoritos", (req, res) => eventoController.listarFavoritos(req, res));
  router.get("/:id", (req, res) => eventoController.obtenerEvento(req, res));
  router.put("/:id/favorito", (req, res) => eventoController.agregarFavorito(req, res));
  router.delete("/:id/favorito", (req, res) => eventoController.quitarFavorito(req, res));

  return router;
}
