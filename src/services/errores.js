// Convierte cualquier error de axios en algo que las pantallas puedan mostrar.
// axios RECHAZA la promesa cuando el servidor responde 4xx/5xx, así que todos los errores llegan al catch.

// Error de la API: status HTTP (0 = sin conexión), mensaje legible y errores por campo ({ correo: '...' })
export class ApiError extends Error {
  constructor(status, mensaje, campos = {}) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
  }
}

// Devuelve el mensaje a mostrar. Hay tres casos (los mismos que en el laboratorio):
export function mensajeDeError(error) {
  // 1. El servidor respondió con un código de error. Nuestra API manda { status, error, campos }.
  if (error.response) {
    return error.response.data?.error ?? `El servidor respondió con el error ${error.response.status}.`
  }
  // 2. La petición salió pero no volvió respuesta: backend apagado, URL incorrecta, timeout o CORS.
  if (error.request) {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.'
  }
  // 3. El error ocurrió antes de enviar (error de programación).
  return error.message
}

// Transforma el error de axios en un ApiError (status + mensaje + campos) para que los formularios
// puedan marcar el campo con problemas. Si ya es un ApiError, lo deja igual.
export function aApiError(error) {
  if (error instanceof ApiError) return error
  return new ApiError(error.response?.status ?? 0, mensajeDeError(error), error.response?.data?.campos ?? {})
}
