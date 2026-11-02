export const EstadoCompra = Object.freeze({
  PENDIENTE: "PENDIENTE",
  CONFIRMADA: "CONFIRMADA",
  UTILIZADA: "UTILIZADA",
  CANCELADA: "CANCELADA",
  REEMBOLSADA: "REEMBOLSADA",
});

// Desde cada estado, a cuáles se puede pasar. UTILIZADA y REEMBOLSADA son finales.
const TRANSICIONES = Object.freeze({
  [EstadoCompra.PENDIENTE]: [EstadoCompra.CONFIRMADA, EstadoCompra.CANCELADA],
  [EstadoCompra.CONFIRMADA]: [EstadoCompra.UTILIZADA, EstadoCompra.CANCELADA],
  [EstadoCompra.CANCELADA]: [EstadoCompra.REEMBOLSADA],
  [EstadoCompra.UTILIZADA]: [],
  [EstadoCompra.REEMBOLSADA]: [],
});

export function esEstadoCompraValido(estado) {
  return Object.values(EstadoCompra).includes(estado);
}

export function puedePasarDe(estadoActual, estadoNuevo) {
  return TRANSICIONES[estadoActual].includes(estadoNuevo);
}
