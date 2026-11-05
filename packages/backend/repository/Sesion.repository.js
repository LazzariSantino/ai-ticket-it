// Guarda qué usuario corresponde a cada token de sesión emitido en el login, y hasta cuándo vale
export class SesionRepository {
  constructor() {
    this.sesiones = new Map();
  }

  async guardar(token, usuario, venceEl) {
    this.sesiones.set(token, { usuario, venceEl });
  }

  async buscar(token) {
    return this.sesiones.get(token) ?? null;
  }

  async eliminar(token) {
    this.sesiones.delete(token);
  }

  // Borra las sesiones vencidas para que la memoria no crezca con cada login
  async eliminarVencidas(ahora) {
    for (const [token, sesion] of this.sesiones) {
      if (sesion.venceEl <= ahora) {
        this.sesiones.delete(token);
      }
    }
  }
}
