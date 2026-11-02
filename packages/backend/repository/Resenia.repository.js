import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class ReseniaRepository extends RepositorioEnMemoria {
  // Las reseñas de todos los eventos de un organizador, de la más nueva a la más vieja
  async buscarPorOrganizador(organizadorId) {
    const resenias = await this.buscarDonde((resenia) => resenia.evento.organizador.id === organizadorId);
    return resenias.sort((a, b) => b.fecha - a.fecha);
  }
}
