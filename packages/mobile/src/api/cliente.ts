import Constants from "expo-constants";
import { Platform } from "react-native";

const PUERTO_BACKEND = 8000;

// En desarrollo el celular llega al backend por la IP de la computadora, que es la misma que usa Expo
// para servir la app (hostUri = "192.168.0.10:8081"). Con EXPO_PUBLIC_API_URL se puede forzar otra.
function calcularUrlBase() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host && Platform.OS !== "web") {
    return `http://${host}:${PUERTO_BACKEND}`;
  }
  return `http://localhost:${PUERTO_BACKEND}`;
}

export const URL_API = calcularUrlBase();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let tokenActual: string | null = null;
let alExpirarSesion: () => void = () => {};

export function configurarSesion(token: string | null, onExpirada: () => void = () => {}) {
  tokenActual = token;
  alExpirarSesion = onExpirada;
}

type Opciones = { metodo?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown };

export async function pedir<T>(ruta: string, { metodo = "GET", body }: Opciones = {}): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        ...(tokenActual ? { Authorization: `Bearer ${tokenActual}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`No se pudo conectar con el servidor (${URL_API}). ¿Está levantado el backend?`, 0);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // Si el backend se reinició, los tokens en memoria se pierden: volvemos al login
    if (respuesta.status === 401 && tokenActual) {
      alExpirarSesion();
    }
    throw new ApiError(datos?.message ?? "Ocurrió un error inesperado", respuesta.status);
  }
  return datos as T;
}
