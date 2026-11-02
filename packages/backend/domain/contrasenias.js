import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Nunca guardamos la contraseña: guardamos "sal:hash" calculado con scrypt (viene con Node, sin dependencias)
export function hashearContrasenia(contrasenia) {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(contrasenia, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

export function contraseniaCoincide(contrasenia, hashGuardado) {
  const [sal, hash] = hashGuardado.split(":");
  const hashIngresado = scryptSync(contrasenia, sal, 64);
  return timingSafeEqual(hashIngresado, Buffer.from(hash, "hex"));
}
