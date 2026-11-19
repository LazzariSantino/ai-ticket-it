import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";

import type { Evento } from "@/api/tipos";
import { formatearPrecio, partesDeFecha } from "@/utils/formato";

// Abre el menú de compartir del celular (WhatsApp, mensajes, mail...) con los datos del evento y su link.
// El link abre el evento en la app; mientras se desarrolla es la dirección de Expo Go en la red local.
export async function compartirEvento(evento: Evento) {
  const fecha = partesDeFecha(evento.fecha);
  const link = Linking.createURL(`/evento/${evento.id}`);
  const precio = formatearPrecio(evento.precioMinimo);
  const mensaje =
    `¡Mirá este evento en AI Ticket It! 🎟️\n` +
    `${evento.nombre}\n` +
    `${fecha.diaSemana} ${fecha.dia} de ${fecha.mesLargo} · ${fecha.hora} h · ` +
    `${evento.precioMinimo > 0 && evento.tiposEntrada.length > 1 ? `desde ${precio}` : precio}\n` +
    link;

  // En un navegador sin menú de compartir, se copia el texto para pegarlo donde se quiera
  if (Platform.OS === "web" && typeof navigator !== "undefined" && !navigator.share) {
    await navigator.clipboard?.writeText(mensaje);
    window.alert("Copiamos el link del evento. Pegalo donde quieras compartirlo.");
    return;
  }
  try {
    await Share.share({ message: mensaje, title: evento.nombre });
  } catch {
    // Cerrar el menú sin compartir no es un error para el usuario
  }
}
