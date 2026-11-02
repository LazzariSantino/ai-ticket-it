# AI Ticket It — App mobile

App en React Native con [Expo](https://expo.dev) (SDK 58) y Expo Router. Las instrucciones para levantarla están en el [README principal](../../README.md).

## Estructura

```
src/
├── app/            # Rutas de Expo Router (cada archivo es una pantalla)
│   ├── (tabs)/     # Pestañas: Explorar, Mis compras, Mis eventos, Perfil
│   ├── evento/     # Detalle del evento y compras del evento (organizador)
│   ├── compra/     # Detalle de la compra y chat
│   ├── crear-evento.tsx
│   ├── login.tsx
│   └── registro.tsx
├── api/            # Cliente HTTP y funciones por recurso del backend
├── components/     # Componentes reutilizables
├── hooks/          # useConsulta (pedidos a la API), useDemorado, tema
├── sesion/         # Contexto con el usuario logueado
├── constants/      # Colores y espaciados
└── utils/          # Formato de precios y fechas, confirmaciones
```

## Comandos

```bash
npm start            # servidor de Expo (escanear el QR con Expo Go)
npm run typecheck    # chequeo de tipos de TypeScript
```
