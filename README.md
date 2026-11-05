# AI Ticket It

Plataforma de publicación de eventos y venta de entradas. Trabajo Práctico Individual de Desarrollo con Inteligencia Artificial, Desarrollo de Software, UTN FRBA, 2C 2026.

- `packages/backend`: API REST con Node + Express y persistencia en memoria.
- `packages/mobile`: app React Native con Expo (SDK 58).

Esta guía explica cómo levantarlo en la PC y en el celular, con qué usuarios entrar y cómo probar cada caso de uso.

## 1. Antes de empezar (una sola vez)

1. **Node 22 o superior.** Revisalo con:

   ```bash
   node -v
   ```

2. **Expo Go** en el celular, actualizada a la última versión (App Store o Play Store).
3. **Cuenta de Expo** (gratis, en [expo.dev/signup](https://expo.dev/signup)). En iPhone es obligatoria: tenés que iniciar sesión con la misma cuenta en la PC y en Expo Go. En la PC:

   ```bash
   npx expo login
   ```

4. **Dependencias**, desde la carpeta del proyecto:

   ```bash
   cd C:\Estudio\DDS\ai-ticket-it
   npm install
   ```

## 2. Levantar el backend

En una terminal, desde `C:\Estudio\DDS\ai-ticket-it`:

```bash
npm run dev:backend
```

Tiene que decir `Backend escuchando en puerto 8000 (con datos de prueba)`. Dejá esa terminal abierta.

- Si Windows pregunta por el **firewall**, marcá **Redes privadas** y aceptá. Si no, el celular no va a poder conectarse.
- Para comprobar que anda, abrí en el navegador de la PC:
  - http://localhost:8000/health → tiene que responder `{"status":"ok"}`.
  - http://localhost:8000/api-docs → documentación de la API (Swagger), donde también se pueden probar los endpoints.

Los datos viven en memoria: cada vez que reiniciás el backend se borra lo que hiciste y se vuelven a cargar los datos de prueba (y hay que volver a iniciar sesión en la app).

## 3. Probarlo en el celular

1. **Averiguá la IP de tu PC.** En PowerShell:

   ```powershell
   ipconfig
   ```

   Usá la "Dirección IPv4" de tu Wi-Fi (por ejemplo `192.168.0.29`). Ignorá la `192.168.56.1`: es de VirtualBox.

2. **Comprobá que el celular llega al backend.** Con el celular en la **misma red Wi-Fi**, abrí en su navegador `http://<IP-de-tu-PC>:8000/health`. Si no carga, revisá el firewall (paso 2) y no sigas hasta que funcione.

3. **Levantá la app.** En otra terminal de PowerShell (la del backend sigue abierta), poniendo tu IP:

   ```powershell
   cd C:\Estudio\DDS\ai-ticket-it
   $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.29"
   npm run start:mobile
   ```

   La segunda línea fuerza la IP del Wi-Fi para que Expo no use la de VirtualBox. En CMD sería `set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.29`.

4. **Abrí la app.** Con la cuenta de Expo iniciada en los dos lados, el proyecto aparece en Expo Go, en **Development servers**. Si no aparece, escaneá el QR con la cámara (iPhone) o con Expo Go (Android).

5. **Comprobá la conexión.** Iniciá sesión y andá a la pestaña **Perfil**: abajo tiene que decir `Servidor: http://<IP-de-tu-PC>:8000`.

## 4. Probarlo en la PC (navegador)

Con `npm run start:mobile` corriendo, apretá **`w`** en esa terminal y se abre la app en el navegador. Para verla como en un celular: `F12` y después el ícono de celular (`Ctrl + Shift + M`).

En el navegador las pestañas aparecen arriba en vez de abajo, y si recargás la página tenés que volver a iniciar sesión.

## 5. Usuarios de prueba

Todos con la contraseña **`123456`**. En la pantalla de login, tocando el email de un usuario se completan los datos solos.

| Email                        | Quién es         | Qué tiene cargado                                                                                             |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `comprador@aiticketit.com`   | Lucía Gómez      | Compras en todos los estados (detalle abajo)                                                                  |
| `organizador@aiticketit.com` | Martín Rodríguez | Organiza Noche de Jazz, Rock en el Galpón, el Stand up de hoy y Tango bajo las estrellas (ya pasó)            |
| `productora@aiticketit.com`  | Carla Fernández  | Organiza Hamlet, la conferencia de IA, Festival Río Sonoro, la final de básquet y Monólogos del Sur (ya pasó) |
| `tomas@aiticketit.com`       | Tomás Ibarra     | Compras confirmadas para Jazz y el Stand up de hoy; reseñó Tango y Monólogos                                  |

Las compras de Lucía:

| Evento                          | Estado                      | Para probar                                                |
| ------------------------------- | --------------------------- | ---------------------------------------------------------- |
| Noche de Jazz en San Telmo      | Confirmada (faltan 12 días) | Días que faltan, chat con mensajes, cancelar con reembolso |
| Rock en el Galpón               | Pendiente de pago           | Pagar, y el plazo para pagar (24 horas)                    |
| Stand up: Risas de Viernes      | Confirmada (es hoy)         | Que el organizador valide la entrada                       |
| Hamlet                          | Reembolsada                 | Historial de estados                                       |
| IA en el desarrollo de software | Cancelada                   | Compra cancelada sin pagar                                 |
| Tango bajo las estrellas        | Utilizada, ya reseñada      | Ver una reseña hecha                                       |
| Monólogos del Sur               | Utilizada, sin reseñar      | Dejar una reseña                                           |

Cualquier usuario puede comprar y también publicar eventos.

## 6. Recorrido para probar todos los casos de uso

**Como compradora** (`comprador@aiticketit.com`):

- [ ] **Buscar y explorar**: en **Explorar**, buscá "musica" (sin tilde), filtrá por una categoría y ordená por Fecha, Precio y Puntaje (con la flecha cambiás el sentido).
- [ ] **Reseñas del organizador**: entrá a un evento de Martín y bajá hasta sus reseñas.
- [ ] **Comprar sin superar el cupo**: en **Rock en el Galpón** elegí **VIP**. Quedan 2, así que el botón `+` no deja pasar de 2. En otros tipos el tope es 10 por compra.
- [ ] **Favoritos**: tocá el ♡ arriba a la derecha de un evento y fijate que aparezca en **Perfil**.
- [ ] **Mis compras**: revisá los colores de cada estado, filtrá por estado y fijate en "Faltan N días" de las confirmadas.
- [ ] **Pagar**: abrí la compra pendiente de Rock, fijate hasta cuándo se puede pagar y tocá **Pagar**. Pasa a Confirmada y aparece "Faltan N días".
- [ ] **Chat**: en la compra de Jazz, tocá **Chatear con el organizador** y mandá un mensaje.
- [ ] **Cancelar con reembolso**: en la compra de Jazz, tocá **Cancelar y pedir reembolso**. Queda Reembolsada y en el historial aparecen los dos pasos.
- [ ] **Reseñar**: en **Monólogos del Sur** elegí las estrellas, escribí un comentario y publicá.
- [ ] **No se puede cancelar una utilizada**: en Tango o Monólogos no aparece el botón de cancelar.

**Como organizador** (`organizador@aiticketit.com`; antes, **Perfil → Cerrar sesión**):

- [ ] **Compras de un evento**: en **Mis eventos** tocá **Stand up: Risas de Viernes**. Vas a ver las compras por estado y cuántas entradas quedan de cada tipo.
- [ ] **Validar una entrada**: abrí la compra de Lucía del Stand up y tocá **Validar entrada**. Queda Utilizada.
- [ ] **Responder el chat**: en **Mis eventos → Noche de Jazz**, abrí la compra de Lucía, entrá al chat y respondé.
- [ ] **Crear un evento**: en **Mis eventos** tocá **+ Crear**. Completá nombre, descripción, categoría, una fecha futura (`AAAA-MM-DD`), la hora y al menos dos tipos de entrada con precio y cupo. Después buscalo en **Explorar**.
- [ ] **No podés comprar tu propio evento**: en el detalle de un evento tuyo no aparece la compra, sino "Ver compras del evento".

Con dos celulares (o celular y navegador), uno con cada usuario, se ve el chat en vivo: los mensajes nuevos llegan solos cada 5 segundos.

## 7. Si algo no funciona

| Problema                                                   | Solución                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| "No se pudo conectar con el servidor"                      | Revisá que el backend esté corriendo, el firewall (paso 2) y la IP (paso 3).    |
| La app te devuelve al login                                | Se reinició el backend (o pasaron 12 horas): iniciá sesión de nuevo.            |
| iPhone: "You need to be signed in to Expo Go and Expo CLI" | Corré `npx expo login` en la PC e iniciá sesión con la misma cuenta en Expo Go. |
| "Port 8081 is being used"                                  | Respondé `Y` para usar otro puerto, o cerrá el otro proyecto de Expo.           |
| Expo Go dice que el SDK no es compatible                   | Actualizá Expo Go.                                                              |
| Hiciste cambios en el código y no se ven                   | En la terminal de Expo apretá `r` para recargar.                                |

## 8. Otros comandos

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm test`          | Tests del backend                         |
| `npm run lint`      | Revisa el código del backend              |
| `npm run typecheck` | Revisa los tipos de la app                |
| `npm run start:dev` | Backend y app juntos en una sola terminal |

Variables opcionales del backend, en `packages/backend/.env` (hay un ejemplo en `.env.example`):

- `DATOS_DE_PRUEBA=false` → arranca vacío, sólo con las categorías.
- `PLAZO_PARA_PAGAR_MINUTOS` → minutos para pagar una compra antes de que se cancele sola (por defecto 1440, o sea 24 horas).
