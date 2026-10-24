// Formatea un número como precio chileno: 549990 -> "$549.990 CLP"
export function formatearPrecio(numero) {
  return '$' + numero.toLocaleString('es-CL') + ' CLP'
}

// Minúsculas y sin tildes, para buscar sin importar acentos
export function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
