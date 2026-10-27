import { useState, useEffect } from 'react'

function obtenerAlmacen(tipo) {
  try {
    return tipo === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null // modo privado o almacenamiento bloqueado
  }
}

// useState que se guarda solo en localStorage (persistente) o sessionStorage (dura la pestaña).
//  - Se lee UNA vez al montar (inicialización perezosa).
//  - useEffect vuelve a escribir cada vez que el valor cambia.
export function useStorage(clave, valorInicial, tipo = 'local') {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = obtenerAlmacen(tipo)?.getItem(clave)
      return guardado !== null && guardado !== undefined ? JSON.parse(guardado) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      obtenerAlmacen(tipo)?.setItem(clave, JSON.stringify(valor))
    } catch {
      // cuota llena o no disponible: la app sigue funcionando, solo no persiste
    }
  }, [clave, valor, tipo])

  return [valor, setValor]
}
