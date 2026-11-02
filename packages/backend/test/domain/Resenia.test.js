import { Resenia } from "../../domain/Resenia.js";
import { Compra } from "../../domain/Compra.js";
import { Evento } from "../../domain/Evento.js";
import { Categoria } from "../../domain/Categoria.js";
import { Usuario } from "../../domain/Usuario.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

function crearUsuario(id, nombre) {
  const usuario = new Usuario({ nombre, apellido: "Test", email: `${nombre}@mail.com`, hashContrasenia: "sal:hash" });
  usuario.id = id;
  return usuario;
}

describe("Dominio: Resenia", () => {
  const organizadora = crearUsuario(1, "orga");
  const compradora = crearUsuario(2, "compradora");
  const evento = { id: 1, nombre: "Obra", fecha: new Date() };

  describe("Constructor", () => {
    it("error si la puntuación está fuera de 1 a 5", () => {
      expect(() => new Resenia({ comprador: compradora, evento, detalle: "Bien", puntuacion: 0 })).toThrow(
        "La puntuación debe ser un número entre 1 y 5",
      );
      expect(() => new Resenia({ comprador: compradora, evento, detalle: "Bien", puntuacion: 6 })).toThrow(
        "La puntuación debe ser un número entre 1 y 5",
      );
    });

    it("error si no tiene comentario", () => {
      expect(() => new Resenia({ comprador: compradora, evento, detalle: "", puntuacion: 4 })).toThrow(
        "La reseña debe tener un comentario",
      );
    });

    it("acepta puntuaciones con decimales", () => {
      expect(new Resenia({ comprador: compradora, evento, detalle: "Muy bueno", puntuacion: 4.5 }).puntuacion).toBe(
        4.5,
      );
    });
  });

  describe("Compra.reseniar", () => {
    const antes = new Date(2026, 11, 1);
    const diaDelEvento = new Date(2026, 11, 10, 22, 0);

    function compraConfirmada() {
      const eventoReal = new Evento({
        nombre: "Stand up",
        descripcion: "Humor",
        categoria: new Categoria({ nombre: "Humor" }),
        fecha: new Date(2026, 11, 10, 21, 0),
        organizador: organizadora,
        tiposEntrada: [{ nombre: "General", precio: 5000, cupo: 10 }],
      });
      const compra = Compra.realizar({
        comprador: compradora,
        evento: eventoReal,
        tipoEntradaId: 1,
        cantidad: 1,
        ahora: antes,
      });
      compra.pagar(compradora, antes);
      return compra;
    }

    it("se puede reseñar una vez utilizada la entrada", () => {
      const compra = compraConfirmada();
      compra.marcarUtilizada(organizadora, diaDelEvento);

      const resenia = compra.reseniar(compradora, { detalle: "Excelente", puntuacion: 5 }, diaDelEvento);

      expect(resenia.puntuacion).toBe(5);
      expect(resenia.evento).toBe(compra.evento);
      expect(compra.puedeSerReseniada()).toBe(false);
    });

    it("no se puede reseñar si la entrada no se utilizó", () => {
      expect(() => compraConfirmada().reseniar(compradora, { detalle: "Excelente", puntuacion: 5 })).toThrow(
        "Sólo se puede reseñar el evento una vez utilizada la entrada",
      );
    });

    it("no se puede reseñar dos veces la misma compra", () => {
      const compra = compraConfirmada();
      compra.marcarUtilizada(organizadora, diaDelEvento);
      compra.reseniar(compradora, { detalle: "Excelente", puntuacion: 5 });

      expect(() => compra.reseniar(compradora, { detalle: "Otra vez", puntuacion: 1 })).toThrow(
        "Esta compra ya tiene una reseña",
      );
    });

    it("sólo puede reseñar quien compró", () => {
      const compra = compraConfirmada();
      compra.marcarUtilizada(organizadora, diaDelEvento);

      expect(() => compra.reseniar(organizadora, { detalle: "Autobombo", puntuacion: 5 })).toThrow(ForbiddenError);
    });
  });
});
