import { useEffect, useState } from "react";

// Devuelve el valor recién cuando dejó de cambiar por un rato: evita pegarle a la API con cada tecla
export function useDemorado<T>(valor: T, milisegundos = 350) {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDemorado(valor), milisegundos);
    return () => clearTimeout(temporizador);
  }, [valor, milisegundos]);

  return demorado;
}
