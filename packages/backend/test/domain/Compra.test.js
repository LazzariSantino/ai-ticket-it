import { Compra } from "../../domain/Compra.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { Evento } from "../../domain/Evento.js";
import { Categoria } from "../../domain/Categoria.js";
import { Usuario } from "../../domain/Usuario.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

function crearUsuario(id, nombre) {
  const usuario = new Usuario({ nombre, apellido: "Test", email: `${nombre}@mail.com`, hashContrasenia: "sal:hash" });
  usuario.id = id;
  return usuario;
}

describe("Dominio: Compra", () => {
  const organizadora = crearUsuario(1, "orga");
  const compradora = crearUsuario(2, "compradora");
  const otro = crearUsuario(3, "otro");

  const antesDelEvento = new Date(2026, 11, 1, 10, 0); // 1/12/2026 10:00
  const diaDelEvento = new Date(2026, 11, 10, 18, 0); // 10/12/2026 18:00
  const despuesDelEvento = new Date(2026, 11, 11, 10, 0);

  let evento;

  beforeEach(() => {
    evento = new Evento({
      nombre: "Festival de Rock",
      descripcion: "Bandas locales",
      categoria: new Categoria({ nombre: "Recitales" }),
      fecha: new Date(2026, 11, 10, 21, 0), // 10/12/2026 21:00
      organizador: organizadora,
      tiposEntrada: [
        { nombre: "Campo", precio: 20000, cupo: 5 },
        { nombre: "VIP", precio: 50000, cupo: 2 },
      ],
    });
    evento.id = 10;
  });

  function comprar(cantidad = 2, tipoEntradaId = 1) {
    return Compra.realizar({ comprador: compradora, evento, tipoEntradaId, cantidad, ahora: antesDelEvento });
  }

  describe("realizar", () => {
    it("crea la compra pendiente, calcula el total y reserva el cupo", () => {
      const compra = comprar(2);

      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
      expect(compra.total).toBe(40000);
      expect(evento.tiposEntrada[0].cupo).toBe(3);
      expect(compra.historial.map((cambio) => cambio.estado)).toEqual([EstadoCompra.PENDIENTE]);
    });

    it("error si la cantidad no es un entero positivo", () => {
      expect(() => comprar(0)).toThrow("La cantidad de entradas debe ser un número entero mayor a 0");
      expect(() => comprar(1.5)).toThrow(UnprocessableEntityError);
    });

    it("error si se supera el cupo disponible del tipo elegido", () => {
      expect(() => comprar(3, 2)).toThrow("No hay cupo suficiente para 3 entradas VIP: quedan 2");
      expect(evento.tiposEntrada[1].cupo).toBe(2);
    });

    it("error si el tipo de entrada no es del evento", () => {
      expect(() => comprar(1, 99)).toThrow("El evento no tiene un tipo de entrada con id 99");
    });

    it("error si el evento ya se realizó", () => {
      expect(() =>
        Compra.realizar({ comprador: compradora, evento, tipoEntradaId: 1, cantidad: 1, ahora: despuesDelEvento }),
      ).toThrow("No se pueden comprar entradas para un evento que ya se realizó");
    });

    it("error si quien compra es el organizador", () => {
      expect(() =>
        Compra.realizar({ comprador: organizadora, evento, tipoEntradaId: 1, cantidad: 1, ahora: antesDelEvento }),
      ).toThrow("No podés comprar entradas de un evento que organizás");
    });
  });

  describe("actualizarEstado", () => {
    it("registra cada cambio en el historial con quién y cuándo", () => {
      const compra = comprar();

      compra.actualizarEstado(EstadoCompra.CONFIRMADA, compradora, antesDelEvento);

      const ultimo = compra.historial.at(-1);
      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(ultimo.estado).toBe(EstadoCompra.CONFIRMADA);
      expect(ultimo.quien).toBe(compradora);
      expect(ultimo.fechaHora).toBe(antesDelEvento);
    });

    it("rechaza transiciones que no corresponden", () => {
      const compra = comprar();

      expect(() => compra.actualizarEstado(EstadoCompra.UTILIZADA, organizadora)).toThrow(
        "Una compra PENDIENTE no puede pasar a UTILIZADA",
      );
    });
  });

  describe("pagar", () => {
    it("confirma la compra", () => {
      const compra = comprar();

      compra.pagar(compradora, antesDelEvento);

      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    });

    it("sólo la puede pagar quien compró", () => {
      expect(() => comprar().pagar(otro)).toThrow(ForbiddenError);
    });
  });

  describe("cancelar", () => {
    it("una compra pendiente pasa a cancelada y libera el cupo", () => {
      const compra = comprar(2);

      compra.cancelar(compradora, antesDelEvento);

      expect(compra.estado).toBe(EstadoCompra.CANCELADA);
      expect(evento.tiposEntrada[0].cupo).toBe(5);
    });

    it("una compra confirmada se cancela y se reembolsa", () => {
      const compra = comprar(2);
      compra.pagar(compradora, antesDelEvento);

      compra.cancelar(compradora, antesDelEvento);

      expect(compra.estado).toBe(EstadoCompra.REEMBOLSADA);
      expect(compra.historial.map((cambio) => cambio.estado)).toEqual([
        EstadoCompra.PENDIENTE,
        EstadoCompra.CONFIRMADA,
        EstadoCompra.CANCELADA,
        EstadoCompra.REEMBOLSADA,
      ]);
      expect(evento.tiposEntrada[0].cupo).toBe(5);
    });

    it("no se puede cancelar una compra utilizada", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);
      compra.marcarUtilizada(organizadora, diaDelEvento);

      expect(compra.puedeCancelarse(diaDelEvento)).toBe(false);
      expect(() => compra.cancelar(compradora, diaDelEvento)).toThrow("No se puede cancelar una compra UTILIZADA");
    });

    it("no se puede cancelar si el evento ya se realizó", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);

      expect(compra.puedeCancelarse(despuesDelEvento)).toBe(false);
      expect(() => compra.cancelar(compradora, despuesDelEvento)).toThrow(
        "No se puede cancelar una compra de un evento que ya se realizó",
      );
    });

    it("no se puede cancelar dos veces", () => {
      const compra = comprar();
      compra.cancelar(compradora, antesDelEvento);

      expect(() => compra.cancelar(compradora, antesDelEvento)).toThrow("No se puede cancelar una compra CANCELADA");
    });

    it("sólo la puede cancelar quien compró", () => {
      expect(() => comprar().cancelar(organizadora, antesDelEvento)).toThrow(ForbiddenError);
    });
  });

  describe("marcarUtilizada", () => {
    it("el organizador la marca utilizada el día del evento", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);

      compra.marcarUtilizada(organizadora, diaDelEvento);

      expect(compra.estado).toBe(EstadoCompra.UTILIZADA);
    });

    it("no se puede utilizar antes del día del evento", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);

      expect(() => compra.marcarUtilizada(organizadora, antesDelEvento)).toThrow(
        "Las entradas sólo se pueden utilizar a partir del día del evento",
      );
    });

    it("no se puede utilizar una compra sin pagar", () => {
      expect(() => comprar().marcarUtilizada(organizadora, diaDelEvento)).toThrow(
        "Una compra PENDIENTE no puede pasar a UTILIZADA",
      );
    });

    it("sólo el organizador puede marcarla", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);

      expect(() => compra.marcarUtilizada(compradora, diaDelEvento)).toThrow(ForbiddenError);
    });
  });

  describe("diasParaEvento", () => {
    it("cuenta los días de calendario que faltan si está confirmada", () => {
      const compra = comprar();
      compra.pagar(compradora, antesDelEvento);

      expect(compra.diasParaEvento(antesDelEvento)).toBe(9);
      expect(compra.diasParaEvento(diaDelEvento)).toBe(0);
    });

    it("es null si la compra no está confirmada", () => {
      expect(comprar().diasParaEvento(antesDelEvento)).toBeNull();
    });
  });

  describe("chat", () => {
    it("comprador y organizador pueden escribir en cualquier estado", () => {
      const compra = comprar();
      compra.cancelar(compradora, antesDelEvento);

      compra.enviarMensaje(compradora, "¿Me confirman el reembolso?", antesDelEvento);
      compra.enviarMensaje(organizadora, "Sí, ya está hecho", antesDelEvento);

      expect(compra.mensajes.map((m) => m.mensaje)).toEqual(["¿Me confirman el reembolso?", "Sí, ya está hecho"]);
      expect(compra.mensajes[1].usuario).toBe(organizadora);
    });

    it("nadie más puede escribir", () => {
      expect(() => comprar().enviarMensaje(otro, "hola")).toThrow(ForbiddenError);
    });

    it("no se pueden enviar mensajes vacíos", () => {
      expect(() => comprar().enviarMensaje(compradora, "   ")).toThrow("El mensaje no puede estar vacío");
    });
  });
});
