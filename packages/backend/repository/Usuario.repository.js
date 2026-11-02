import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class UsuarioRepository extends RepositorioEnMemoria {
  async buscarPorEmail(email) {
    return this.elementos.find((usuario) => usuario.email === email) ?? null;
  }
}
