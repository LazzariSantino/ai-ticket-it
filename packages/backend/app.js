import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { crearMiddlewareAutenticar } from "./middleware/autenticar.js";
import { montarSwagger } from "./config/swagger.js";
import { cargarDatosDePrueba } from "./seed/datosDePrueba.js";

import { crearAuthRouter } from "./routes/Auth.routes.js";
import { crearCategoriaRouter } from "./routes/Categoria.routes.js";
import { crearEventoRouter } from "./routes/Evento.routes.js";
import { crearCompraRouter, crearComprasDeEventoRouter } from "./routes/Compra.routes.js";

import { AuthController } from "./controllers/Auth.controller.js";
import { CategoriaController } from "./controllers/Categoria.controller.js";
import { EventoController } from "./controllers/Evento.controller.js";
import { CompraController } from "./controllers/Compra.controller.js";

import { AuthService } from "./services/Auth.service.js";
import { CategoriaService } from "./services/Categoria.service.js";
import { EventoService } from "./services/Evento.service.js";
import { CompraService } from "./services/Compra.service.js";

import { UsuarioRepository } from "./repository/Usuario.repository.js";
import { SesionRepository } from "./repository/Sesion.repository.js";
import { CategoriaRepository } from "./repository/Categoria.repository.js";
import { EventoRepository } from "./repository/Evento.repository.js";
import { ReseniaRepository } from "./repository/Resenia.repository.js";
import { CompraRepository } from "./repository/Compra.repository.js";

// Arma la aplicación sin levantar el servidor, así los tests pueden crear una instancia nueva cada vez.
// `reloj` permite fijar "el momento actual" en los tests. Con `vencerPendientesCadaMs` se revisa cada ese tiempo
// si hay compras sin pagar fuera de plazo (los tests no lo activan: llaman al service cuando lo necesitan).
export async function crearApp({
  reloj = () => new Date(),
  conDatosDePrueba = false,
  plazoParaPagarEnMinutos,
  vencerPendientesCadaMs,
} = {}) {
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
  const eventoRepository = new EventoRepository();
  const reseniaRepository = new ReseniaRepository();
  const compraRepository = new CompraRepository();

  // Services
  const authService = new AuthService(usuarioRepository, sesionRepository);
  const categoriaService = new CategoriaService(categoriaRepository);
  await categoriaService.cargarCategoriasIniciales();
  const eventoService = new EventoService(eventoRepository, categoriaRepository, reseniaRepository, reloj);
  const compraService = new CompraService(
    compraRepository,
    eventoService,
    reseniaRepository,
    reloj,
    plazoParaPagarEnMinutos,
  );

  if (conDatosDePrueba) {
    await cargarDatosDePrueba(
      { usuarioRepository, categoriaRepository, eventoRepository, compraRepository, reseniaRepository },
      reloj(),
    );
  }

  // Controllers
  const authController = new AuthController(authService);
  const categoriaController = new CategoriaController(categoriaService);
  const eventoController = new EventoController(eventoService);
  const compraController = new CompraController(compraService);

  // Routes
  const autenticar = crearMiddlewareAutenticar(authService);
  app.use("/auth", crearAuthRouter(authController, autenticar));
  app.use("/categorias", crearCategoriaRouter(categoriaController));
  app.use("/eventos/:eventoId/compras", crearComprasDeEventoRouter(compraController, autenticar));
  app.use("/eventos", crearEventoRouter(eventoController, autenticar));
  app.use("/compras", crearCompraRouter(compraController, autenticar));

  // Manejo de errores
  app.use(errorHandler);

  if (vencerPendientesCadaMs) {
    const intervalo = setInterval(() => {
      compraService
        .vencerComprasPendientes()
        .then((cantidad) => cantidad > 0 && console.log(`Se vencieron ${cantidad} compra(s) sin pagar`))
        .catch((error) => console.error("Error al vencer compras pendientes:", error));
    }, vencerPendientesCadaMs);
    intervalo.unref();
  }

  return app;
}
