// Registro histórico de cada etapa por la que pasa una compra: qué estado, quién lo provocó y cuándo.
// quien = null cuando el cambio lo hizo el sistema (por ejemplo, al vencer el plazo para pagar).
export class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora = new Date() }) {
    this.compra = compra;
    this.estado = estado;
    this.quien = quien;
    this.fechaHora = fechaHora;
  }

  toJSON() {
    return { estado: this.estado, quien: this.quien?.resumen() ?? null, fechaHora: this.fechaHora };
  }
}
