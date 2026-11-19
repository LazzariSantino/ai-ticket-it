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
  // Son eventos reales de Buenos Aires (2026 y 2027). Las fechas se acomodan alrededor del arranque del servidor
  // para que la demo siempre tenga eventos próximos, uno hoy y otros ya realizados con reseñas.
  const evento = async (datos) => await eventoRepository.guardar(new Evento(datos));

  const tanBionica = await evento({
    nombre: "Tan Biónica en el Movistar Arena",
    descripcion: "La banda de Chano y Bambi repasa sus himnos de siempre y las canciones nuevas. Puertas 19:30.",
    categoria: await categoria("Recitales"),
    fecha: enDias(12),
    multimedia: [imagen("tan-bionica-arena"), imagen("tan-bionica-luces")],
    organizador: martin,
    tiposEntrada: [
      { nombre: "Campo", descripcion: "De pie", precio: 65000, cupo: 120 },
      { nombre: "Platea VIP", descripcion: "Ubicación numerada con vista central", precio: 120000, cupo: 20 },
    ],
  });
  const deepPurple = await evento({
    nombre: "Deep Purple en el Movistar Arena",
    descripcion: 'Los creadores de "Smoke on the Water" vuelven a Buenos Aires con un show de clásicos del hard rock.',
    categoria: await categoria("Recitales"),
    fecha: enDias(21, 21),
    multimedia: [imagen("deep-purple-arena")],
    organizador: martin,
    tiposEntrada: [
      { nombre: "Campo", descripcion: "Frente al escenario", precio: 85000, cupo: 500 },
      { nombre: "Platea", descripcion: "Sector sentado", precio: 110000, cupo: 150 },
      { nombre: "VIP", descripcion: "Palco con meet & greet", precio: 250000, cupo: 3 },
    ],
  });
  // Es hoy, un rato más tarde, para poder validar entradas en la demo
  const standUp = await evento({
    nombre: "Stand up: Fede Simonetti",
    descripcion:
      "El comediante presenta su unipersonal en la Terraza Teatro Bar de Paseo La Plaza (Av. Corrientes 1660).",
    categoria: await categoria("Stand up"),
    fecha: new Date(Math.min(ahora.getTime() + 2 * 60 * 60 * 1000, enDias(0, 23, 59).getTime())),
    multimedia: [imagen("fede-simonetti-standup")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", precio: 25000, cupo: 80 }],
  });
  const ekoparty = await evento({
    nombre: "Ekoparty 2026",
    descripcion:
      "La conferencia de seguridad informática más antigua de Latinoamérica: charlas de hacking, CTF y talleres.",
    categoria: await categoria("Conferencias"),
    fecha: enDias(-20, 10),
    multimedia: [imagen("ekoparty-hacking")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", descripcion: "Acceso a charlas y CTF", precio: 40000, cupo: 200 }],
  });
  const unPoyoRojo = await evento({
    nombre: "Un Poyo Rojo",
    descripcion: "Teatro físico, danza y humor sin palabras en el Teatro Metropolitan, sobre la calle Corrientes.",
    categoria: await categoria("Teatro"),
    fecha: enDias(20, 20, 30),
    multimedia: [imagen("un-poyo-rojo-teatro")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Platea", precio: 38000, cupo: 200 },
      { nombre: "Pullman", precio: 28000, cupo: 100 },
    ],
  });
  const encuentroTelecom = await evento({
    nombre: "Encuentro Argentino de Telecomunicaciones, Electrónica y Computación",
    descripcion:
      "Jornada de FUNDETEC sobre redes, conectividad, ciberseguridad e inteligencia artificial, presencial y con transmisión en línea.",
    categoria: await categoria("Conferencias"),
    fecha: enDias(14, 9),
    multimedia: [imagen("encuentro-telecom-redes")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "General", descripcion: "Acceso a las charlas", precio: 0, cupo: 300 },
      {
        nombre: "Presencial con certificado",
        descripcion: "Charlas + certificado de asistencia",
        precio: 15000,
        cupo: 25,
      },
    ],
  });
  await evento({
    nombre: "Lollapalooza Argentina 2027",
    descripcion:
      "Tres días en el Hipódromo de San Isidro con Travis Scott, Charli xcx, The Killers, TINI, David Guetta y más de 70 artistas.",
    categoria: await categoria("Festivales"),
    fecha: enDias(113, 12),
    multimedia: [imagen("lollapalooza-hipodromo"), imagen("lollapalooza-escenario")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Abono 3 días", precio: 420000, cupo: 1000 },
      { nombre: "Entrada por día", precio: 190000, cupo: 800 },
    ],
  });
  await evento({
    nombre: "Final del Torneo Clausura 2026",
    descripcion: "La final del fútbol argentino en el Estadio Único Diego Armando Maradona de La Plata.",
    categoria: await categoria("Deportes"),
    fecha: enDias(23, 19),
    multimedia: [imagen("final-clausura-estadio")],
    organizador: carla,
    tiposEntrada: [
      { nombre: "Popular", precio: 45000, cupo: 2000 },
      { nombre: "Platea", precio: 90000, cupo: 500 },
    ],
  });
  const nerdearla = await evento({
    nombre: "Nerdearla Argentina 2026",
    descripcion:
      "El evento de tecnología gratuito más grande de habla hispana, organizado por Sysarmy en Ciudad Cultural Konex: IA, open source y ciencia.",
    categoria: await categoria("Conferencias"),
    fecha: enDias(-40, 10),
    multimedia: [imagen("nerdearla-konex")],
    organizador: carla,
    tiposEntrada: [{ nombre: "General", descripcion: "Entrada gratuita con inscripción", precio: 0, cupo: 60 }],
  });

  // --- Compras en todos los estados ---
  const comprar = async (comprador, eventoComprado, tipoEntradaId, cantidad, momento) =>
    await compraRepository.guardar(
      Compra.realizar({ comprador, evento: eventoComprado, tipoEntradaId, cantidad, ahora: momento }),
    );
  const haceUnRato = enDias(-1, 10);

  const tanBionicaLucia = await comprar(lucia, tanBionica, 1, 2, haceUnRato);
  tanBionicaLucia.pagar(lucia, haceUnRato);
  tanBionicaLucia.enviarMensaje(lucia, "Hola! ¿Hay estacionamiento cerca del Movistar Arena?", haceUnRato);
  tanBionicaLucia.enviarMensaje(
    martin,
    "Hola Lucía, sí: hay varios garages sobre Humboldt, pero te recomendamos llegar temprano.",
    haceUnRato,
  );

  // Pendiente de pago, hecha al arrancar el servidor: tiene todo el plazo para pagar por delante
  await comprar(lucia, deepPurple, 3, 1, ahora);

  const unPoyoRojoLucia = await comprar(lucia, unPoyoRojo, 1, 2, enDias(-3, 12));
  unPoyoRojoLucia.pagar(lucia, enDias(-3, 12));
  unPoyoRojoLucia.cancelar(lucia, enDias(-2, 9));
  unPoyoRojoLucia.enviarMensaje(lucia, "Tuve que cancelar por un viaje, ¿el reembolso es automático?", enDias(-2, 9));

  const encuentroLucia = await comprar(lucia, encuentroTelecom, 2, 1, enDias(-2, 15));
  encuentroLucia.cancelar(lucia, enDias(-2, 16));

  const standUpLucia = await comprar(lucia, standUp, 1, 2, haceUnRato);
  standUpLucia.pagar(lucia, haceUnRato);

  const tanBionicaTomas = await comprar(tomas, tanBionica, 1, 4, haceUnRato);
  tanBionicaTomas.pagar(tomas, haceUnRato);
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

  await asistir(
    lucia,
    ekoparty,
    4,
    "Muy buenas charlas de hacking y el CTF estuvo genial, aunque las filas eran largas.",
  );
  await asistir(tomas, ekoparty, 5, "Organización perfecta, empezó puntual y los talleres valieron cada peso.");
  await asistir(
    tomas,
    nerdearla,
    3.5,
    "Charlas de primer nivel sobre IA y open source, pero las salas se llenaban rápido.",
  );
  // Lucía fue a Nerdearla y todavía no la reseñó: sirve para probar la reseña desde la app
  await asistir(lucia, nerdearla);
}
