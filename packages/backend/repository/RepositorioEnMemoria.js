// Persistencia en memoria: los datos viven mientras el servidor esté levantado.
// Los métodos son async igual que si hubiera una base de datos detrás, así los servicios no cambian si mañana la hay.
export class RepositorioEnMemoria {
  constructor() {
    this.elementos = [];
    this.siguienteId = 1;
  }

  async guardar(elemento) {
    if (elemento.id === undefined) {
      elemento.id = this.siguienteId++;
      this.elementos.push(elemento);
    }
    return elemento;
  }

  async buscarPorId(id) {
    return this.elementos.find((elemento) => elemento.id === Number(id)) ?? null;
  }

  async buscarTodos() {
    return [...this.elementos];
  }

  async buscarDonde(condicion) {
    return this.elementos.filter(condicion);
  }
}
