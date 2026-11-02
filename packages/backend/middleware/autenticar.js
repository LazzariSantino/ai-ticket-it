// Lee el token del header "Authorization: Bearer <token>" y deja el usuario logueado en req.usuario
export function crearMiddlewareAutenticar(authService) {
  return async function autenticar(req, res, next) {
    const [tipo, token] = (req.headers.authorization ?? "").split(" ");
    req.token = tipo === "Bearer" ? token : undefined;
    req.usuario = await authService.usuarioDeToken(req.token);
    next();
  };
}
