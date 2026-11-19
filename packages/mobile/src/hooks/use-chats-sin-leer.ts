import { useEffect, useState } from "react";

import { listarChats } from "@/api/compras";

// Cada cuánto se revisa si llegaron mensajes nuevos (igual que el chat abierto)
const INTERVALO_MS = 5000;

// Cuántos chats tienen mensajes sin leer, para el número de la pestaña Mensajes
export function useChatsSinLeer() {
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    let activo = true;
    const consultar = async () => {
      try {
        const chats = await listarChats();
        if (activo) setCantidad(chats.filter((chat) => (chat.mensajesSinLeer ?? 0) > 0).length);
      } catch {
        // Sin conexión no se cambia el número: se vuelve a intentar en el próximo intervalo
      }
    };
    consultar();
    const intervalo = setInterval(consultar, INTERVALO_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return cantidad;
}
