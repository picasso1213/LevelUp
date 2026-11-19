import api from './api.js'

// POST /auth/login -> { token, usuario }
export async function login(correo, password) {
  const respuesta = await api.post('/auth/login', { correo: correo.trim(), password }, { autenticada: false })
  return respuesta.data
}

// POST /auth/register -> { token, usuario, conReferido }
// "datos" es el formulario completo; password2 (la confirmación) no se envía al servidor.
export async function registrarUsuario(datos) {
  const { password2, ...resto } = datos // eslint-disable-line no-unused-vars
  const cuerpo = {
    ...resto,
    nombre: resto.nombre.trim(),
    apellidos: resto.apellidos.trim(),
    run: resto.run.trim(),
    correo: resto.correo.trim(),
    telefono: (resto.telefono || '').trim(),
    direccion: resto.direccion.trim(),
    codigoReferido: (resto.codigoReferido || '').trim(),
  }
  const respuesta = await api.post('/auth/register', cuerpo, { autenticada: false })
  return respuesta.data
}

// POST /auth/refresh -> { token, usuario }
// Cambia el token que aún no vence (se envía en el encabezado Authorization) por uno nuevo.
// Un token ya vencido no se puede renovar: el servidor responde 401 y hay que iniciar sesión otra vez.
export async function renovarToken() {
  const respuesta = await api.post('/auth/refresh')
  return respuesta.data
}
