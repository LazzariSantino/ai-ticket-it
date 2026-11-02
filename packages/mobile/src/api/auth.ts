import { pedir } from "./cliente";
import type { Sesion, Usuario } from "./tipos";

export const login = (email: string, contrasenia: string) =>
  pedir<Sesion>("/auth/login", { metodo: "POST", body: { email, contrasenia } });

export const registrar = (datos: { nombre: string; apellido: string; email: string; contrasenia: string }) =>
  pedir<Sesion>("/auth/registro", { metodo: "POST", body: datos });

export const logout = () => pedir<void>("/auth/logout", { metodo: "POST" });

export const usuarioActual = () => pedir<Usuario>("/auth/yo");
