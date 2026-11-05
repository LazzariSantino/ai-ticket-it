import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class ReseniaRepository extends RepositorioEnMemoria {
  async buscarDeCompradorEnEvento(compradorId, eventoId) {
    const [resenia] = await this.buscarDonde((r) => r.comprador.id === compradorId && r.evento.id === eventoId);
    return resenia ?? null;
  }

  // Las reseñas de todos los eventos de un organizador, de la más nueva a la más vieja
  async buscarPorOrganizador(organizadorId) {
    const resenias = await this.buscarDonde((resenia) => resenia.evento.organizador.id === organizadorId);
    return resenias.sort((a, b) => b.fecha - a.fecha);
  }
}
