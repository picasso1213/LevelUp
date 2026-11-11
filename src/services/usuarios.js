import api from './api.js'

// Perfil del usuario con sesión (cualquier rol)
export async function obtenerMiPerfil() {
  return (await api.get('/usuarios/me')).data
}

export async function actualizarMiPerfil(cambios) {
  return (await api.put('/usuarios/me', cambios)).data
}

// -> { canje: { id, nombre, costo }, usuario }
export async function canjearPuntos(idCanje) {
  return (await api.post('/usuarios/me/canjes', { idCanje })).data
}

// Administración de usuarios (solo ADMIN)
export async function listarUsuarios() {
  return (await api.get('/usuarios')).data
}

export async function cambiarRol(id, rol) {
  return (await api.put(`/usuarios/${id}/rol`, { rol })).data
}

export async function eliminarUsuario(id) {
  await api.delete(`/usuarios/${id}`)
}
