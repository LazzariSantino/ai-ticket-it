import "dotenv/config";
import { crearApp } from "./app.js";

// Con DATOS_DE_PRUEBA=false arranca vacío (sólo con las categorías)
const conDatosDePrueba = process.env.DATOS_DE_PRUEBA !== "false";
const app = await crearApp({ conDatosDePrueba });

// 0.0.0.0 para que el celular pueda llegar al backend por la red local
const PORT = process.env.SERVER_PORT || process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en puerto ${PORT}${conDatosDePrueba ? " (con datos de prueba)" : ""}`);
  console.log(`Documentación de la API: http://localhost:${PORT}/api-docs`);
});
