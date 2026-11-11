import { useCallback, useEffect, useState } from 'react'

// Carga datos del backend al montar. `funcion` debe ser estable (una función de services/, no una flecha nueva).
//   const { datos, cargando, error, recargar } = useApi(listarBoletas, [])
export function useApi(funcion, valorInicial = null) {
  const [datos, setDatos] = useState(valorInicial)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setDatos(await funcion())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [funcion])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { datos, cargando, error, recargar }
}
