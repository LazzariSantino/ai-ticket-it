import { Compra } from "../domain/Compra.js";
import { Evento } from "../domain/Evento.js";
import { Usuario } from "../domain/Usuario.js";

export const CONTRASENIA_DE_PRUEBA = "123456";

// Datos para probar la app sin cargar nada a mano. Las fechas son relativas al momento en que arranca el
// servidor, así siempre hay eventos próximos, uno que es hoy (para validar entradas) y otros ya realizados.
export async function cargarDatosDePrueba(
  { usuarioRepository, categoriaRepository, eventoRepository, compraRepository, reseniaRepository },
  ahora = new Date(),
) {
  const enDias = (dias, hora = 21, minutos = 0) => {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(hora, minutos, 0, 0);
    return fecha;
  };
  const categoria = async (nombre) => (await categoriaRepository.buscarTodos()).find((c) => c.nombre === nombre);
  const imagen = (semilla) => `https://picsum.photos/seed/${semilla}/800/450`;

  // --- Usuarios (todos con la misma contraseña) ---
  const usuario = async (nombre, apellido, email) =>
    await usuarioRepository.guardar(Usuario.registrar({ nombre, apellido, email, contrasenia: CONTRASENIA_DE_PRUEBA }));

  const lucia = await usuario("Lucía", "Gómez", "comprador@aiticketit.com");
  const martin = await usuario("Martín", "Rodríguez", "organizador@aiticketit.com");
  const carla = await usuario("Carla", "Fernández", "productora@aiticketit.com");
  const tomas = await usuario("Tomás", "Ibarra", "tomas@aiticketit.com");

  // --- Eventos ---
  const evento = async (datos) => await eventoRepository.guardar(new Evento(datos));

  const jazz = await evento({
    nombre: "Noche de Jazz en San Telmo",
    descripcion: "Un trío de jazz clásico y standards en el sótano más íntimo de San Telmo. Puertas 20:30.",
    categoria: await categoria("Recitales"),
    fecha: enDias(12),
    multimedia: [imagen("jazz-san-telmo"), imagen("jazz-trio")],
    organizador: martin,
    tiposEntrada: [
      { nombre: "General", descripcion: "De pie", precio: 12000, cupo: 120 },
      { nombre: "VIP", descripcion: "Mesa con consumición", precio: 25000, cupo: 20 },
    ],
  });
  const rock = await evento({
    nombre: "Rock en el Galpón",
    descripcion: "Cuatro bandas del under porteño en una noche a puro rock and roll.",
    categoria: await categoria("Recitales"),
    fecha: enDias(30, 20),
    multimedia: [imagen("rock-galpon")],
    organizador: martin,
    tiposEntrada: [
      { nombre: "Campo", descripcion: "Frente al escenario", precio: 18000, cupo: 500 },
      { nombre: "Platea", descripcion: "Sector sentado", precio: 28000, cupo: 150 },
      { nombre: "VIP", descripcion: "Palco con barra libre", precio: 45000, cupo: 3 },
    ],
  });
  // Es hoy, un rato más tarde, para poder validar entradas en la demo
  const standUp = await evento({
    nombre: "Stand up: Risas de Viernes",
    descripcion: "Cinco comediantes, un micrófono y ninguna piedad.",
    categoria: await categoria("Stand up"),
    fecha: new Date(Math.min(ahora.getTime() + 2 * 60 * 60 * 1000, enDias(0, 23, 59).getTime())),
    multimedia: [imagen("standup-risas")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", precio: 9000, cupo: 80 }],
  });
  const tango = await evento({
    nombre: "Tango bajo las estrellas",
    descripcion: "Orquesta típica y milonga al aire libre.",
    categoria: await categoria("Recitales"),
    fecha: enDias(-20),
    multimedia: [imagen("tango-estrellas")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", precio: 10000, cupo: 200 }],
  });
  const hamlet = await evento({
    nombre: "Hamlet",
    descripcion: "El clásico de Shakespeare en una puesta moderna, con elenco de primer nivel.",
    categoria: await categoria("Teatro"),
    fecha: enDias(20, 20, 30),
    multimedia: [imagen("hamlet-teatro")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Platea", precio: 15000, cupo: 200 },
      { nombre: "Pullman", precio: 9000, cupo: 100 },
    ],
  });
  const conferencia = await evento({
    nombre: "IA en el desarrollo de software",
    descripcion: "Charlas sobre cómo usar herramientas de inteligencia artificial para programar mejor.",
    categoria: await categoria("Conferencias"),
    fecha: enDias(7, 18),
    multimedia: [imagen("conferencia-ia")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "General", descripcion: "Acceso a las charlas", precio: 0, cupo: 300 },
      { nombre: "Workshop", descripcion: "Charlas + taller práctico", precio: 20000, cupo: 25 },
    ],
  });
  await evento({
    nombre: "Festival Río Sonoro",
    descripcion: "Dos días de música a orillas del río con más de 20 artistas.",
    categoria: await categoria("Festivales"),
    fecha: enDias(60, 16),
    multimedia: [imagen("festival-rio"), imagen("festival-escenario")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Abono 2 días", precio: 60000, cupo: 1000 },
      { nombre: "Entrada por día", precio: 35000, cupo: 800 },
    ],
  });
  await evento({
    nombre: "Final de la Liga de Básquet",
    descripcion: "El partido decisivo de la temporada.",
    categoria: await categoria("Deportes"),
    fecha: enDias(15, 19),
    multimedia: [imagen("basquet-final")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Popular", precio: 8000, cupo: 2000 },
      { nombre: "Platea", precio: 22000, cupo: 500 },
    ],
  });
  const monologos = await evento({
    nombre: "Monólogos del Sur",
    descripcion: "Humor patagónico en un formato íntimo.",
    categoria: await categoria("Stand up"),
    fecha: enDias(-40),
    multimedia: [imagen("monologos-sur")],
    organizador: carla,
    tiposEntrada: [{ nombre: "General", precio: 7000, cupo: 60 }],
  });

  // --- Compras en todos los estados ---
  const comprar = async (comprador, eventoComprado, tipoEntradaId, cantidad, momento) =>
    await compraRepository.guardar(
      Compra.realizar({ comprador, evento: eventoComprado, tipoEntradaId, cantidad, ahora: momento }),
    );
  const haceUnRato = enDias(-1, 10);

  const jazzLucia = await comprar(lucia, jazz, 1, 2, haceUnRato);
  jazzLucia.pagar(lucia, haceUnRato);
  jazzLucia.enviarMensaje(lucia, "Hola! ¿Hay estacionamiento cerca del lugar?", haceUnRato);
  jazzLucia.enviarMensaje(
    martin,
    "Hola Lucía, sí: hay un garage en la esquina con descuento mostrando la entrada.",
    haceUnRato,
  );

  // Pendiente de pago, hecha al arrancar el servidor: tiene todo el plazo para pagar por delante
  await comprar(lucia, rock, 3, 1, ahora);

  const hamletLucia = await comprar(lucia, hamlet, 1, 2, enDias(-3, 12));
  hamletLucia.pagar(lucia, enDias(-3, 12));
  hamletLucia.cancelar(lucia, enDias(-2, 9));
  hamletLucia.enviarMensaje(lucia, "Tuve que cancelar por un viaje, ¿el reembolso es automático?", enDias(-2, 9));

  const conferenciaLucia = await comprar(lucia, conferencia, 2, 1, enDias(-2, 15));
  conferenciaLucia.cancelar(lucia, enDias(-2, 16));

  const standUpLucia = await comprar(lucia, standUp, 1, 2, haceUnRato);
  standUpLucia.pagar(lucia, haceUnRato);

  const jazzTomas = await comprar(tomas, jazz, 1, 4, haceUnRato);
  jazzTomas.pagar(tomas, haceUnRato);
  const standUpTomas = await comprar(tomas, standUp, 1, 1, haceUnRato);
  standUpTomas.pagar(tomas, haceUnRato);

  // --- Eventos ya realizados: entradas utilizadas y reseñas ---
  const asistir = async (comprador, eventoPasado, puntuacion, detalle) => {
    const antes = new Date(eventoPasado.fecha.getTime() - 7 * 24 * 60 * 60 * 1000);
    const compra = await comprar(comprador, eventoPasado, 1, 1, antes);
    compra.pagar(comprador, antes);
    compra.marcarUtilizada(eventoPasado.organizador, eventoPasado.fecha);
    if (puntuacion) {
      const despues = new Date(eventoPasado.fecha.getTime() + 24 * 60 * 60 * 1000);
      await reseniaRepository.guardar(compra.reseniar(comprador, { puntuacion, detalle }, despues));
    }
    return compra;
  };

  await asistir(lucia, tango, 4, "Hermosa noche, aunque hacía bastante frío. La orquesta, impecable.");
  await asistir(tomas, tango, 5, "Organización perfecta, empezó puntual y el sonido era muy bueno.");
  await asistir(tomas, monologos, 3.5, "Divertido, pero la sala era chica y se escuchaba mal desde atrás.");
  // Lucía fue a Monólogos del Sur y todavía no la reseñó: sirve para probar la reseña desde la app
  await asistir(lucia, monologos);
}
