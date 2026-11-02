# AI Ticket It

Plataforma de publicación de eventos y venta de entradas. Trabajo Práctico Individual de **Desarrollo con Inteligencia Artificial** de la materia **Desarrollo de Software (DDS)**, UTN FRBA, 2C 2026.

Los organizadores publican eventos con distintos tipos de entrada (precio y cupo) y siguen sus ventas; los compradores exploran el catálogo, compran, siguen el estado de cada compra, chatean con el organizador y reseñan los eventos a los que fueron.

## 📦 Estructura del proyecto

Monorepo con **npm workspaces**:

```
.
├── packages/
│   ├── backend/   # API REST con Node + Express, persistencia en memoria
│   └── mobile/    # App React Native con Expo (SDK 58) y Expo Router
├── package.json   # Scripts del monorepo
└── README.md
```

### Backend (`packages/backend`)

Arquitectura en capas, igual que en el TP de la materia:

| Capa         | Carpeta                                 | Responsabilidad                                                                                                                                                              |
| ------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dominio      | `domain/`                               | Reglas del negocio: `Evento`, `TipoEntrada`, `Compra`, `EstadoCompra`, `CambioEstadoCompra`, `Mensaje`, `Resenia`, `Usuario`, `Categoria` (diagrama de clases del enunciado) |
| Repositorios | `repository/`                           | Persistencia **en memoria** (`RepositorioEnMemoria`), con métodos async como si hubiera una base                                                                             |
| Servicios    | `services/`                             | Casos de uso: buscan en los repositorios, delegan en el dominio y guardan                                                                                                    |
| Controllers  | `controllers/`                          | Leen la request, validan la forma del body y responden                                                                                                                       |
| Rutas        | `routes/`                               | Asocian cada endpoint con su controller                                                                                                                                      |
| Errores      | `errors/`, `middleware/errorHandler.js` | `AppError` y subclases (400, 401, 403, 404, 409, 422) que el manejador traduce a la respuesta HTTP                                                                           |

- **Express 5**: los errores que se lanzan en un controller async llegan solos al `errorHandler`.
- **Autenticación**: login con email y contraseña (hasheada con `scrypt` de Node). El login devuelve un token que la app manda en `Authorization: Bearer <token>`.
- **Swagger**: con el backend levantado, la documentación interactiva está en `http://localhost:8000/api-docs`. Cada recurso tiene su YAML en `packages/backend/docs`.
- **Tests** con Jest y Supertest: dominio, repositorios, servicios y API (`npm test`).
- **Datos de prueba**: al arrancar se cargan usuarios, eventos y compras en todos los estados, con fechas relativas al día de hoy (hay un evento que es hoy, para poder validar entradas, y eventos pasados con reseñas).

### Mobile (`packages/mobile`)

App con Expo Router: pestañas nativas (Explorar, Mis compras, Mis eventos, Perfil) y pantallas apiladas para el detalle del evento, la compra, el chat y la creación de eventos. Está escrita en TypeScript. Ver [`packages/mobile/README.md`](packages/mobile/README.md).

## 🚀 Cómo levantarlo

Requisitos: Node 22 o superior (probado con Node 24), y la app **Expo Go** en el celular (Android o iOS). El celular y la computadora tienen que estar en la **misma red Wi-Fi**.

```bash
npm install
```

En una terminal, el backend (puerto 8000):

```bash
npm run dev:backend
```

En otra terminal, la app:

```bash
npm run start:mobile
```

Escaneá el QR con Expo Go (Android) o con la cámara (iOS). La app encuentra sola el backend usando la misma IP con la que Expo sirve la app.

> **Si la app no llega al backend** (el perfil muestra a qué URL apunta):
>
> - Permití Node.js en el firewall de Windows para redes privadas (puerto 8000).
> - Si la computadora tiene varias placas de red (por ejemplo VirtualBox), Expo puede elegir una IP equivocada. Forzá la correcta:
>   `set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.10` antes de `npm run start:mobile`, o indicá la URL del backend con `EXPO_PUBLIC_API_URL=http://192.168.0.10:8000` en `packages/mobile/.env`.

Todos los scripts del monorepo:

| Script                 | Qué hace                       |
| ---------------------- | ------------------------------ |
| `npm run dev:backend`  | Backend con recarga automática |
| `npm run start:mobile` | Servidor de Expo               |
| `npm run start:dev`    | Los dos juntos                 |
| `npm test`             | Tests del backend              |
| `npm run lint`         | ESLint del backend             |
| `npm run typecheck`    | Chequeo de tipos de la app     |
| `npm run format`       | Prettier en todo el repo       |

Con `DATOS_DE_PRUEBA=false` el backend arranca vacío (sólo con las categorías).

## 👤 Usuarios de prueba

Todos con la contraseña `123456`. En la pantalla de login se pueden tocar para completar los datos.

| Email                        | Rol en los datos de prueba                                                     |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `comprador@aiticketit.com`   | Lucía, con compras en todos los estados y una compra utilizada sin reseñar     |
| `organizador@aiticketit.com` | Martín, organiza Jazz, Rock, el Stand up de hoy y un evento pasado con reseñas |
| `productora@aiticketit.com`  | Carla, organiza Hamlet, una conferencia, un festival y un partido              |
| `tomas@aiticketit.com`       | Tomás, otro comprador                                                          |

Un mismo usuario puede comprar y organizar: no hay roles separados, el organizador de un evento es quien lo creó.

## ✅ Casos de uso

| Caso de uso                                                                                   | En la app                                             | Endpoint                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| Ver mis compras con su estado y los días que faltan si está confirmada                        | Pestaña **Mis compras** (filtro por estado) → detalle | `GET /compras`                   |
| Ver las compras de un evento por estado y las entradas que quedan de cada tipo                | **Mis eventos** → un evento                           | `GET /eventos/:id/compras`       |
| Buscar eventos por texto o explorarlos por categoría                                          | Pestaña **Explorar**                                  | `GET /eventos?q=&categoriaId=`   |
| Ordenar por precio, fecha del evento y puntaje del organizador                                | **Explorar** → "Ordenar por"                          | `GET /eventos?orden=&direccion=` |
| Crear un evento con varios tipos de entrada, cada uno con precio y cupo                       | **Mis eventos** → "+ Crear"                           | `POST /eventos`                  |
| Comprar eligiendo tipo de entrada y cantidad, sin superar el cupo                             | Detalle del evento                                    | `POST /compras`                  |
| Chat de la compra (comprador y organizador, en cualquier momento)                             | Detalle de la compra → "Chatear"                      | `GET/POST /compras/:id/mensajes` |
| Cancelar una compra para obtener el reembolso, si no está utilizada y el evento no se realizó | Detalle de la compra                                  | `POST /compras/:id/cancelacion`  |
| Puntuar el evento y comentar una vez utilizada la entrada                                     | Detalle de una compra utilizada                       | `POST /compras/:id/resenia`      |
| Ver las reseñas de eventos anteriores del organizador antes de comprar                        | Detalle del evento                                    | `GET /eventos/:id`               |

Además: pagar una compra pendiente (pago simulado, `POST /compras/:id/pago`), validar una entrada en el acceso el día del evento (`POST /compras/:id/uso`) y guardar eventos favoritos (`PUT/DELETE /eventos/:id/favorito`).

### Estados de una compra

```
PENDIENTE ──pagar──▶ CONFIRMADA ──validar en el acceso──▶ UTILIZADA ──▶ (se puede reseñar)
    │                    │
 cancelar             cancelar
    ▼                    ▼
CANCELADA            CANCELADA ──▶ REEMBOLSADA
```

Cada cambio queda registrado como un `CambioEstadoCompra` (estado, quién y cuándo), que la app muestra como historial. Al cancelar se libera el cupo.

## 🤖 Uso de IA

El proyecto se desarrolló con **Claude Code** como herramienta principal, partiendo del enunciado y del diagrama de clases, y siguiendo la arquitectura y convenciones vistas en la materia. Cada funcionalidad quedó en un commit separado para poder revisarla de a una.
