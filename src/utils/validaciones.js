// Valida un RUN chileno con dígito verificador (acepta con o sin K final)
export function esRunValido(valor) {
  const limpio = valor.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()
  if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) return false

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  let suma = 0
  let multiplo = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }

  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === dvEsperado
}

// Solo permite correos @duoc.cl, @profesor.duoc.cl y @gmail.com (regla de negocio del caso)
export function esCorreoPermitido(valor) {
  return /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(valor.trim())
}

// Formato básico de correo (newsletter, sin restricción de dominio)
export function esCorreoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
}

// Correo institucional Duoc => 20% de descuento de por vida
export function esCorreoDuoc(correo) {
  return /@(duoc\.cl|profesor\.duoc\.cl)$/i.test(correo.trim())
}

// Edad en años a partir de "YYYY-MM-DD" (null si la fecha no es válida)
export function calcularEdad(fechaNacimiento, hoy = new Date()) {
  const nacimiento = new Date(fechaNacimiento + 'T00:00:00')
  if (isNaN(nacimiento.getTime())) return null
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

// Validación completa del formulario de registro: devuelve { campo: 'mensaje' } (vacío = todo OK)
export function validarRegistro(v, usuarios = []) {
  const errores = {}
  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
  if (!v.apellidos.trim()) errores.apellidos = 'Los apellidos son obligatorios.'
  if (!esRunValido(v.run)) errores.run = 'Ingresa un RUN válido (ej: 123456785).'

  if (!v.correo.trim() || !esCorreoPermitido(v.correo)) {
    errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.'
  } else if (usuarios.some((u) => u.correo.toLowerCase() === v.correo.trim().toLowerCase())) {
    errores.correo = 'Ya existe una cuenta registrada con ese correo.'
  }

  if (!v.fechaNacimiento) {
    errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.'
  } else {
    const edad = calcularEdad(v.fechaNacimiento)
    if (edad === null || edad < 18) errores.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte.'
  }

  if (v.password.length < 4) errores.password = 'Mínimo 4 caracteres.'
  if (!v.password2 || v.password2 !== v.password) errores.password2 = 'Las contraseñas no coinciden.'
  if (!v.region) errores.region = 'Selecciona tu región.'
  if (!v.comuna) errores.comuna = 'Selecciona tu comuna.'
  if (!v.direccion.trim()) errores.direccion = 'La dirección es obligatoria.'
  return errores
}

// Validación del formulario de contacto
export function validarContacto(v) {
  const errores = {}
  const nombre = v.nombre.trim()
  const correo = v.correo.trim()
  const mensaje = v.mensaje.trim()

  if (!nombre) errores.nombre = 'El nombre completo es obligatorio.'
  else if (nombre.length > 100) errores.nombre = 'El nombre no puede superar los 100 caracteres.'

  if (correo) {
    if (correo.length > 100) errores.correo = 'El correo no puede superar los 100 caracteres.'
    else if (!esCorreoPermitido(correo)) errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.'
  }

  if (!mensaje) errores.mensaje = 'Cuéntanos en qué te podemos ayudar.'
  else if (mensaje.length > 500) errores.mensaje = 'El mensaje no puede superar los 500 caracteres.'

  if (!v.terminos) errores.terminos = 'Debes aceptar para que podamos contactarte.'
  return errores
}
