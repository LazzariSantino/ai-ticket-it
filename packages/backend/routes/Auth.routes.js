import { Router } from "express";

export function crearAuthRouter(authController, autenticar) {
  const router = Router();
  router.post("/registro", (req, res) => authController.registrar(req, res));
  router.post("/login", (req, res) => authController.login(req, res));
  router.post("/logout", autenticar, (req, res) => authController.logout(req, res));
  router.get("/yo", autenticar, (req, res) => authController.usuarioActual(req, res));

  return router;
}
