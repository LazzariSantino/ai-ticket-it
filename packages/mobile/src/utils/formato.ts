const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio: number) {
  return precio === 0 ? "Gratis" : formatoPrecio.format(precio);
}

// "vie 10 dic · 21:00"
export function formatearFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const dia = fecha.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dia} · ${hora}`;
}

// "10/12/2026 21:00"
export function formatearFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return `${fecha.toLocaleDateString("es-AR")} ${fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

export function formatearPuntaje(puntaje: number | null, cantidad: number) {
  return puntaje === null ? "Sin reseñas" : `★ ${puntaje.toFixed(1)} (${cantidad})`;
}

export function textoDiasParaEvento(dias: number) {
  if (dias === 0) return "¡Es hoy!";
  if (dias === 1) return "Falta 1 día";
  return `Faltan ${dias} días`;
}
