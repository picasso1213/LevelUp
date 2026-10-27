import { describe, it, expect } from 'vitest'
import {
  esRunValido, esCorreoPermitido, esCorreoDuoc, esCorreoValido,
  calcularEdad, validarRegistro, validarContacto,
} from './validaciones.js'

describe('esRunValido', () => {
  it('acepta un RUN correcto con y sin puntos ni guión', () => {
    expect(esRunValido('123456785')).toBe(true)
    expect(esRunValido('12.345.678-5')).toBe(true)
  })

  it('calcula bien los dígitos verificadores 0 y K', () => {
    expect(esRunValido('100000040')).toBe(true)
    expect(esRunValido('10000013K')).toBe(true)
    expect(esRunValido('10000013k')).toBe(true)
  })

  it('rechaza dígito verificador incorrecto y formatos inválidos', () => {
    expect(esRunValido('123456780')).toBe(false)
    expect(esRunValido('abc')).toBe(false)
    expect(esRunValido('')).toBe(false)
  })
})

describe('correos', () => {
  it('solo permite @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(esCorreoPermitido('ana@duoc.cl')).toBe(true)
    expect(esCorreoPermitido('profe@profesor.duoc.cl')).toBe(true)
    expect(esCorreoPermitido('ana@gmail.com')).toBe(true)
    expect(esCorreoPermitido('ana@hotmail.com')).toBe(false)
  })

  it('detecta el correo institucional que da 20% de descuento', () => {
    expect(esCorreoDuoc('ana@duoc.cl')).toBe(true)
    expect(esCorreoDuoc('ana@gmail.com')).toBe(false)
  })

  it('valida el formato básico del correo del newsletter', () => {
    expect(esCorreoValido('x@y.cl')).toBe(true)
    expect(esCorreoValido('sin-arroba')).toBe(false)
  })
})

describe('calcularEdad', () => {
  const hoy = new Date(2026, 9, 21) // 21-oct-2026

  it('resta un año si aún no cumple años', () => {
    expect(calcularEdad('2000-10-22', hoy)).toBe(25)
    expect(calcularEdad('2000-10-21', hoy)).toBe(26)
  })

  it('devuelve null con una fecha inválida', () => {
    expect(calcularEdad('no-es-fecha', hoy)).toBeNull()
  })
})

describe('validarRegistro', () => {
  const valido = {
    nombre: 'Ana', apellidos: 'Pérez', run: '123456785', correo: 'ana@duoc.cl',
    fechaNacimiento: '1995-05-10', password: 'abcd', password2: 'abcd',
    region: 'Valparaíso', comuna: 'Viña del Mar', direccion: 'Calle 1',
  }

  it('no devuelve errores con datos correctos', () => {
    expect(validarRegistro(valido, [])).toEqual({})
  })

  it('marca todos los campos obligatorios vacíos', () => {
    const vacio = { ...valido, nombre: '', apellidos: '', run: '', correo: '', fechaNacimiento: '', password: '', password2: '', region: '', comuna: '', direccion: '' }
    const errores = validarRegistro(vacio, [])
    expect(Object.keys(errores)).toHaveLength(10)
  })

  it('rechaza menores de 18 años', () => {
    const menor = `${new Date().getFullYear() - 10}-01-01`
    expect(validarRegistro({ ...valido, fechaNacimiento: menor }, []).fechaNacimiento).toMatch(/mayor de 18/)
  })

  it('rechaza un correo ya registrado y contraseñas distintas', () => {
    const errores = validarRegistro({ ...valido, password2: 'otra' }, [{ correo: 'ANA@duoc.cl' }])
    expect(errores.correo).toMatch(/Ya existe/)
    expect(errores.password2).toMatch(/no coinciden/)
  })
})

describe('validarContacto', () => {
  const valido = { nombre: 'Ana', correo: '', mensaje: 'Hola', terminos: true }

  it('el correo es opcional pero, si se escribe, debe ser de un dominio permitido', () => {
    expect(validarContacto(valido)).toEqual({})
    expect(validarContacto({ ...valido, correo: 'a@hotmail.com' }).correo).toBeDefined()
  })

  it('exige aceptar los términos y limita el mensaje a 500 caracteres', () => {
    expect(validarContacto({ ...valido, terminos: false }).terminos).toBeDefined()
    expect(validarContacto({ ...valido, mensaje: 'x'.repeat(501) }).mensaje).toMatch(/500/)
  })
})
