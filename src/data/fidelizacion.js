// Programa de referidos y gamificación Level-Up
export const PUNTOS_POR_REFERIDO = 50 // gana quien invita, por cada persona que se registra con su código
export const PUNTOS_BONUS_REFERIDO_NUEVO = 20 // gana el usuario nuevo si entró con un código válido
export const PUNTOS_POR_CADA_1000_CLP = 1 // puntos ganados al comprar

export const NIVELES_LEVELUP = [
  { nombre: 'Bronce', puntosMin: 0 },
  { nombre: 'Plata', puntosMin: 100 },
  { nombre: 'Oro', puntosMin: 300 },
  { nombre: 'Platino', puntosMin: 700 },
  { nombre: 'Diamante', puntosMin: 1500 },
]

export const CANJES_LEVELUP = [
  { id: 'cupon5', nombre: 'Cupón 5% de descuento', costo: 100 },
  { id: 'cupon10', nombre: 'Cupón 10% de descuento', costo: 250 },
  { id: 'mouse', nombre: 'Mouse Logitech G502 HERO gratis', costo: 400 },
  { id: 'polera', nombre: 'Polera Personalizada Level-Up gratis', costo: 600 },
]
