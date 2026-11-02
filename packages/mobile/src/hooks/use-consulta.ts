import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

// Pide datos a la API cada vez que la pantalla gana el foco (así al volver de otra pantalla se ven los cambios)
// y expone el estado de carga, el error y una función para recargar.
export function useConsulta<T>(consultar: () => Promise<T>, dependencias: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const pedidoActual = useRef(0);

  // `consultar` se recrea en cada render: se memoriza según las dependencias que indica la pantalla
  const consultarMemo = useCallback(consultar, dependencias);

  const ejecutar = useCallback(
    async (esRecarga: boolean) => {
      const numeroDePedido = ++pedidoActual.current;
      if (esRecarga) setRecargando(true);
      try {
        const resultado = await consultarMemo();
        // Si mientras tanto se lanzó otro pedido (por ejemplo, el usuario siguió escribiendo), se descarta este
        if (numeroDePedido === pedidoActual.current) {
          setDatos(resultado);
          setError(null);
        }
      } catch (e) {
        if (numeroDePedido === pedidoActual.current) {
          setError(e instanceof Error ? e.message : "Ocurrió un error");
        }
      } finally {
        if (numeroDePedido === pedidoActual.current) {
          setCargando(false);
          setRecargando(false);
        }
      }
    },
    [consultarMemo],
  );

  useFocusEffect(
    useCallback(() => {
      ejecutar(false);
    }, [ejecutar]),
  );

  const recargar = useCallback(() => ejecutar(true), [ejecutar]);

  return { datos, setDatos, error, cargando, recargando, recargar };
}
