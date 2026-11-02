import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class EventoRepository extends RepositorioEnMemoria {
  async buscarPorOrganizador(organizadorId) {
    return this.buscarDonde((evento) => evento.organizador.id === organizadorId);
  }
}
