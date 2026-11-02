import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import * as authApi from "@/api/auth";
import { configurarSesion } from "@/api/cliente";
import type { Sesion, Usuario } from "@/api/tipos";

type ContextoSesion = {
  usuario: Usuario | null;
  iniciarSesion: (email: string, contrasenia: string) => Promise<void>;
  registrarse: (datos: Parameters<typeof authApi.registrar>[0]) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (usuario: Usuario) => void;
};

const Contexto = createContext<ContextoSesion | null>(null);

// La sesión vive en memoria, igual que los datos del backend: si se reinicia uno, se vuelve a loguear
export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const guardarSesion = useCallback((nueva: Sesion | null) => {
    configurarSesion(nueva?.token ?? null, () => guardarSesion(null));
    setSesion(nueva);
  }, []);

  const valor = useMemo<ContextoSesion>(
    () => ({
      usuario: sesion?.usuario ?? null,
      iniciarSesion: async (email, contrasenia) => guardarSesion(await authApi.login(email, contrasenia)),
      registrarse: async (datos) => guardarSesion(await authApi.registrar(datos)),
      cerrarSesion: async () => {
        await authApi.logout().catch(() => {});
        guardarSesion(null);
      },
      actualizarUsuario: (usuario) => setSesion((actual) => (actual ? { ...actual, usuario } : actual)),
    }),
    [sesion, guardarSesion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useSesion se tiene que usar dentro de un SesionProvider");
  }
  return contexto;
}

// Para pantallas que sólo se muestran con la sesión iniciada
export function useUsuario() {
  const { usuario } = useSesion();
  if (!usuario) {
    throw new Error("No hay un usuario logueado");
  }
  return usuario;
}
