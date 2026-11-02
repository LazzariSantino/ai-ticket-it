import { Usuario } from "../domain/Usuario.js";

// Usuario listo para usar en tests, sin pasar por el hasheo de la contraseña
export function crearUsuario(id, nombre = `usuario${id}`) {
  const usuario = new Usuario({ nombre, apellido: "Test", email: `${nombre}@mail.com`, hashContrasenia: "sal:hash" });
  usuario.id = id;
  return usuario;
}

export function datosDeEvento(categoriaId, cambios = {}) {
  return {
    nombre: "Noche de Jazz",
    descripcion: "Trío en vivo",
    categoriaId,
    fecha: "2026-12-10T21:00:00.000Z",
    tiposEntrada: [
      { nombre: "General", precio: 10000, cupo: 100 },
      { nombre: "VIP", precio: 30000, cupo: 10 },
    ],
    ...cambios,
  };
}
