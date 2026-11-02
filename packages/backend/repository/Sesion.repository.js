// Guarda qué usuario corresponde a cada token de sesión emitido en el login
export class SesionRepository {
  constructor() {
    this.sesiones = new Map();
  }

  async guardar(token, usuario) {
    this.sesiones.set(token, usuario);
  }

  async buscarUsuario(token) {
    return this.sesiones.get(token) ?? null;
  }

  async eliminar(token) {
    this.sesiones.delete(token);
  }
}
