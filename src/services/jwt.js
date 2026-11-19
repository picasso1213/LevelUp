// Lectura del vencimiento de un JWT (solo para saber cuándo renovarlo; la firma la valida el servidor).

// Decodifica el payload (segunda parte del token, base64url). Devuelve null si el token no es un JWT válido.
export function leerPayload(token) {
  if (typeof token !== 'string') return null
  const partes = token.split('.')
  if (partes.length !== 3) return null
  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const texto = decodeURIComponent(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const payload = JSON.parse(texto)
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

// Momento de vencimiento en milisegundos (como Date.now()), o null si el token no trae "exp".
export function vencimientoDe(token) {
  const exp = leerPayload(token)?.exp
  return typeof exp === 'number' ? exp * 1000 : null
}
