export class CategoriaController {
  constructor(categoriaService) {
    this.categoriaService = categoriaService;
  }

  async listarCategorias(req, res) {
    const categorias = await this.categoriaService.listarCategorias();
    return res.status(200).json(categorias);
  }
}
