import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class CompraRepository extends RepositorioEnMemoria {
  async buscarPorComprador(compradorId) {
    return this.buscarDonde((compra) => compra.comprador.id === compradorId);
  }

  async buscarPendientesVencidas(ahora) {
    return this.buscarDonde((compra) => compra.estaVencida(ahora));
  }

  async buscarPorEvento(eventoId) {
    return this.buscarDonde((compra) => compra.evento.id === eventoId);
  }
}
