import axios from 'axios'
import { ApiError, aApiError } from './errores.js'

// Una sola instancia de axios para toda la aplicación: todas las llamadas al backend (Spring Boot) pasan por aquí.
//   · desarrollo (.env.development):  VITE_API_URL=http://localhost:8081/api/v1
//   · producción (.env.production):   VITE_API_URL=/api/v1  (Nginx pasa /api a Spring Boot)
// timeout: si el servidor no contesta en 8 s, la petición se cancela y cae en el catch.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

export { ApiError }

const CLAVE_TOKEN = 'levelup_token'

export function obtenerToken() {
  try {
    return window.localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null // almacenamiento bloqueado (modo privado)
  }
}

// Guarda el JWT; con null lo borra (cierre de sesión o token vencido)
export function guardarToken(token) {
  try {
    if (token) window.localStorage.setItem(CLAVE_TOKEN, token)
    else window.localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // sin almacenamiento: la sesión dura solo mientras la pestaña siga abierta
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { Accept: 'application/json' },
})

// Interceptor de petición: se ejecuta ANTES de cada petición y agrega el JWT.
// Las rutas públicas pueden pasar { autenticada: false } para no enviarlo.
api.interceptors.request.use((config) => {
  const token = config.autenticada === false ? null : obtenerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (import.meta.env.DEV) console.info('→', config.method?.toUpperCase(), `${config.baseURL}${config.url}`, config.params ?? '')
  return config
})

// Interceptor de respuesta: los errores de axios se convierten en ApiError (status, mensaje, campos),
// así los contextos y formularios no necesitan conocer axios.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => Promise.reject(aApiError(error)),
)

export default api
