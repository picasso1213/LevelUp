// "2026-11-10T18:30:00" (ISO del backend) -> "10-11-2026 18:30"
export function formatearFecha(iso) {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (isNaN(fecha.getTime())) return ''
  return fecha.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}
