import { Router } from "express";

export function crearCompraRouter(compraController, autenticar) {
  const router = Router();
  router.use(autenticar);

  router.post("/", (req, res) => compraController.comprar(req, res));
  router.get("/", (req, res) => compraController.listarMisCompras(req, res));
  router.get("/:id", (req, res) => compraController.obtenerCompra(req, res));
  // Cada acción que cambia el estado de la compra es un recurso propio, así queda claro qué regla se aplica
  router.post("/:id/pago", (req, res) => compraController.pagar(req, res));
  router.post("/:id/cancelacion", (req, res) => compraController.cancelar(req, res));
  router.post("/:id/uso", (req, res) => compraController.marcarUtilizada(req, res));
  router.get("/:id/mensajes", (req, res) => compraController.listarMensajes(req, res));
  router.post("/:id/mensajes", (req, res) => compraController.enviarMensaje(req, res));
  router.post("/:id/resenia", (req, res) => compraController.reseniar(req, res));

  return router;
}

// Se monta en /eventos/:eventoId/compras, por eso necesita los params de la ruta padre
export function crearComprasDeEventoRouter(compraController, autenticar) {
  const router = Router({ mergeParams: true });
  router.use(autenticar);

  router.get("/", (req, res) => compraController.listarComprasDeEvento(req, res));

  return router;
}
