// Registro histórico de cada etapa por la que pasa una compra: qué estado, quién lo provocó y cuándo
export class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora = new Date() }) {
    this.compra = compra;
    this.estado = estado;
    this.quien = quien;
    this.fechaHora = fechaHora;
  }

  toJSON() {
    return { estado: this.estado, quien: this.quien.resumen(), fechaHora: this.fechaHora };
  }
}
