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
  // Fotos reales de Wikimedia Commons, todas con licencia libre (CC o dominio público)
  const foto = (ruta) => `https://thumb.wikimedia.org/wikipedia/commons/thumb/${ruta}`;

  // --- Usuarios (todos con la misma contraseña) ---
  const usuario = async (nombre, apellido, email) =>
    await usuarioRepository.guardar(Usuario.registrar({ nombre, apellido, email, contrasenia: CONTRASENIA_DE_PRUEBA }));

  const lucia = await usuario("Lucía", "Gómez", "comprador@aiticketit.com");
  const martin = await usuario("Martín", "Rodríguez", "organizador@aiticketit.com");
  const carla = await usuario("Carla", "Fernández", "productora@aiticketit.com");
  const tomas = await usuario("Tomás", "Ibarra", "tomas@aiticketit.com");
  const sofia = await usuario("Sofía", "Benítez", "sofia@aiticketit.com");
  const nicolas = await usuario("Nicolás", "Paz", "nicolas@aiticketit.com");

  // --- Eventos ---
  // Son eventos reales de Buenos Aires (2026 y 2027). Las fechas se acomodan alrededor del arranque del servidor
  // para que la demo siempre tenga eventos próximos, uno hoy y otros ya realizados con reseñas.
  const evento = async (datos) => await eventoRepository.guardar(new Evento(datos));

  const tanBionica = await evento({
    nombre: "Tan Biónica en el Movistar Arena",
    descripcion: "La banda de Chano y Bambi repasa sus himnos de siempre y las canciones nuevas. Puertas 19:30.",
    categoria: await categoria("Recitales"),
    fecha: enDias(12),
    multimedia: [
      foto("3/3f/Tan_Bi%C3%B3nica.JPG/960px-Tan_Bi%C3%B3nica.JPG"),
      foto("f/fa/Movistar_Arena_junio_de_2025_-_BugWarp_02.jpg/960px-Movistar_Arena_junio_de_2025_-_BugWarp_02.jpg"),
    ],
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
    // Primero la foto con el músico al centro, que se ve bien con cualquier recorte
    multimedia: [
      foto("e/e3/Deep_Purple_-_MN_Gredos_-_03.jpg/960px-Deep_Purple_-_MN_Gredos_-_03.jpg"),
      foto(
        "0/05/Deep_Purple_live_at_BTarena_in_Cluj-Napoca%2C_Transylvania%2C_Romania_%281_October%2C_2026%29.jpg/960px-Deep_Purple_live_at_BTarena_in_Cluj-Napoca%2C_Transylvania%2C_Romania_%281_October%2C_2026%29.jpg",
      ),
    ],
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
    multimedia: [foto("e/ee/Standup_Shot_Template.jpg/960px-Standup_Shot_Template.jpg")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", precio: 25000, cupo: 80 }],
  });
  const ekoparty = await evento({
    nombre: "Ekoparty 2026",
    descripcion:
      "La conferencia de seguridad informática más antigua de Latinoamérica: charlas de hacking, CTF y talleres.",
    categoria: await categoria("Conferencias"),
    fecha: enDias(-20, 10),
    multimedia: [foto("e/e2/Danilo_Erazo_at_Ekoparty.jpg/960px-Danilo_Erazo_at_Ekoparty.jpg")],
    organizador: martin,
    tiposEntrada: [{ nombre: "General", descripcion: "Acceso a charlas y CTF", precio: 40000, cupo: 200 }],
  });
  const unPoyoRojo = await evento({
    nombre: "Un Poyo Rojo",
    descripcion: "Teatro físico, danza y humor sin palabras en el Teatro Metropolitan, sobre la calle Corrientes.",
    categoria: await categoria("Teatro"),
    fecha: enDias(20, 20, 30),
    multimedia: [
      foto(
        "1/1e/Teatro_Metropolitan_en_Avenida_Corrientes%2C_Buenos_Aires.jpg/960px-Teatro_Metropolitan_en_Avenida_Corrientes%2C_Buenos_Aires.jpg",
      ),
    ],
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
    multimedia: [
      foto("5/5d/BalticServers_data_center.jpg/960px-BalticServers_data_center.jpg"),
      foto("8/83/Fujikura_optic_fiber_at_Science_Museum.jpg/960px-Fujikura_optic_fiber_at_Science_Museum.jpg"),
    ],
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
    // El cartel con el logo bien centrado primero, después el arco de la entrada y el público de la edición argentina
    multimedia: [
      foto("3/3e/Lollapalooza_sign.jpg/960px-Lollapalooza_sign.jpg"),
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Lollapalooza_Chile.jpg",
      foto("2/2a/Lollapalooza_Argentina_2015.jpg/960px-Lollapalooza_Argentina_2015.jpg"),
    ],
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
    multimedia: [
      foto(
        "a/a0/Estadio_%C3%9Anico_de_La_Plata%2C_Buenos_Aires%2C_Argentina%2C_Noche%2C_mar-2011_-_panoramio.jpg/960px-Estadio_%C3%9Anico_de_La_Plata%2C_Buenos_Aires%2C_Argentina%2C_Noche%2C_mar-2011_-_panoramio.jpg",
      ),
      foto("9/9f/Estadio_%C3%9Anico_de_La_Plata.jpg/960px-Estadio_%C3%9Anico_de_La_Plata.jpg"),
    ],
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
    multimedia: [
      foto("1/1c/Nerdearla_-_2017_-_20.jpg/960px-Nerdearla_-_2017_-_20.jpg"),
      foto("1/12/Ciudad_Cultural_Konex.jpg/960px-Ciudad_Cultural_Konex.jpg"),
    ],
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
    "Fui por primera vez y salí con la cabeza explotada, la charla de hardware hacking fue lo mejor del día. " +
      "Le saco una estrella porque la fila del viernes a la mañana daba la vuelta a la manzana y el café se terminó a las 11.",
  );
  await asistir(
    tomas,
    ekoparty,
    5,
    "Tercer año que voy y cada vez está mejor. Me anoté al CTF con dos amigos de la facu, terminamos 14° y nos " +
      "divertimos como nunca. Los talleres tienen cupo, así que si querés uno llegá temprano.",
  );
  await asistir(
    nicolas,
    ekoparty,
    4,
    "Muy buen nivel. Algunas charlas me pasaron por arriba, pero igual se aprende un montón escuchando. " +
      "El sábado el lugar quedó chico y había gente sentada en el piso de los pasillos.",
  );
  await asistir(
    tomas,
    nerdearla,
    3.5,
    "Las charlas de IA estuvieron buenísimas y encima es gratis, así que mucho no me puedo quejar. Pero las salas " +
      "chicas se llenaban 15 minutos antes y me quedé afuera de dos que quería ver.",
  );
  await asistir(
    sofia,
    nerdearla,
    4.5,
    "No puedo creer que algo así sea gratis. Conocí gente de un montón de empresas, me llevé stickers para toda la " +
      "notebook y la charla del creador de SQLite fue de otro planeta. El año que viene vuelvo seguro.",
  );
  // Lucía fue a Nerdearla y todavía no la reseñó: sirve para probar la reseña desde la app
  await asistir(lucia, nerdearla);
}
