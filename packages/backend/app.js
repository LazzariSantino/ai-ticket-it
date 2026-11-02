import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { crearMiddlewareAutenticar } from "./middleware/autenticar.js";
import { montarSwagger } from "./config/swagger.js";

import { crearAuthRouter } from "./routes/Auth.routes.js";
import { crearCategoriaRouter } from "./routes/Categoria.routes.js";

import { AuthController } from "./controllers/Auth.controller.js";
import { CategoriaController } from "./controllers/Categoria.controller.js";

import { AuthService } from "./services/Auth.service.js";
import { CategoriaService } from "./services/Categoria.service.js";

import { UsuarioRepository } from "./repository/Usuario.repository.js";
import { SesionRepository } from "./repository/Sesion.repository.js";
import { CategoriaRepository } from "./repository/Categoria.repository.js";

// Arma la aplicación sin levantar el servidor, así los tests pueden crear una instancia nueva cada vez.
// `reloj` permite fijar "el momento actual" en los tests.
export async function crearApp({ reloj = () => new Date() } = {}) {
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
  const categoriaRepository = new CategoriaRepository();

  // Services
  const authService = new AuthService(usuarioRepository, sesionRepository);
  const categoriaService = new CategoriaService(categoriaRepository);
  await categoriaService.cargarCategoriasIniciales();

  // Controllers
  const authController = new AuthController(authService);
  const categoriaController = new CategoriaController(categoriaService);

  // Routes
  const autenticar = crearMiddlewareAutenticar(authService);
  app.use("/auth", crearAuthRouter(authController, autenticar));
  app.use("/categorias", crearCategoriaRouter(categoriaController));

  // Manejo de errores
  app.use(errorHandler);

  return app;
}
