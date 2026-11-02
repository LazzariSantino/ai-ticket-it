import { Router } from "express";

export function crearCompraRouter(compraController, autenticar) {
  const router = Router();
  router.use(autenticar);

  router.post("/", (req, res) => compraController.comprar(req, res));
  router.get("/", (req, res) => compraController.listarMisCompras(req, res));
  router.get("/:id", (req, res) => compraController.obtenerCompra(req, res));

  return router;
}

// Se monta en /eventos/:eventoId/compras, por eso necesita los params de la ruta padre
export function crearComprasDeEventoRouter(compraController, autenticar) {
  const router = Router({ mergeParams: true });
  router.use(autenticar);

  router.get("/", (req, res) => compraController.listarComprasDeEvento(req, res));

  return router;
}
