import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { montarSwagger } from "./config/swagger.js";

// Arma la aplicación sin levantar el servidor, así los tests pueden crear una instancia nueva cada vez
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

  // Manejo de errores
  app.use(errorHandler);

  return app;
}
