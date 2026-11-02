import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { crearMiddlewareAutenticar } from "./middleware/autenticar.js";
import { montarSwagger } from "./config/swagger.js";

import { crearAuthRouter } from "./routes/Auth.routes.js";

import { AuthController } from "./controllers/Auth.controller.js";

import { AuthService } from "./services/Auth.service.js";

import { UsuarioRepository } from "./repository/Usuario.repository.js";
import { SesionRepository } from "./repository/Sesion.repository.js";

// Arma la aplicación sin levantar el servidor, así los tests pueden crear una instancia nueva (y vacía) cada vez
export function crearApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : true,
    }),
  );

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // Documentación de la API en /api-docs
  montarSwagger(app);

  // Repositories
  const usuarioRepository = new UsuarioRepository();
  const sesionRepository = new SesionRepository();

  // Services
  const authService = new AuthService(usuarioRepository, sesionRepository);

  // Controllers
  const authController = new AuthController(authService);

  // Routes
  const autenticar = crearMiddlewareAutenticar(authService);
  app.use("/auth", crearAuthRouter(authController, autenticar));

  // Manejo de errores
  app.use(errorHandler);

  return app;
}
