import { NIVELES_LEVELUP } from '../data/fidelizacion.js'

// Código de referido a partir de las iniciales + sufijo aleatorio (ej: "JP4F2K")
export function generarCodigoReferido(nombre, apellidos) {
  const iniciales = ((nombre[0] || '') + (apellidos[0] || '')).toUpperCase()
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return iniciales + sufijo
}

// Nivel actual, siguiente nivel y % de progreso según los puntos acumulados
export function obtenerNivelActual(puntos) {
  let actual = NIVELES_LEVELUP[0]
  let siguiente = null

  NIVELES_LEVELUP.forEach((nivel, i) => {
    if (puntos >= nivel.puntosMin) {
      actual = nivel
      siguiente = NIVELES_LEVELUP[i + 1] || null
    }
  })

  const progreso = siguiente
    ? Math.min(100, Math.round(((puntos - actual.puntosMin) / (siguiente.puntosMin - actual.puntosMin)) * 100))
    : 100

  return { actual, siguiente, progreso }
}
