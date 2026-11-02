import { Categoria } from "../domain/Categoria.js";

// Catálogo fijo de categorías con el que arranca la plataforma
export const CATEGORIAS_INICIALES = [
  { nombre: "Recitales", descripcion: "Música en vivo, bandas y solistas" },
  { nombre: "Teatro", descripcion: "Obras, musicales y danza" },
  { nombre: "Stand up", descripcion: "Humor y monólogos" },
  { nombre: "Deportes", descripcion: "Partidos, carreras y torneos" },
  { nombre: "Conferencias", descripcion: "Charlas, congresos y talleres" },
  { nombre: "Festivales", descripcion: "Eventos de varios días o con muchos artistas" },
];

export class CategoriaService {
  constructor(categoriaRepository) {
    this._repository = categoriaRepository;
  }

  async cargarCategoriasIniciales() {
    for (const datos of CATEGORIAS_INICIALES) {
      await this._repository.guardar(new Categoria(datos));
    }
  }

  async listarCategorias() {
    return await this._repository.buscarTodos();
  }
}
