import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, crearUsuario } from '../test/utils.jsx'

// Completa el formulario con datos válidos; "cambios" permite pisar algún campo
async function llenarFormulario(usuario, cambios = {}) {
  const d = {
    nombre: 'Luis', apellidos: 'Soto', run: '123456785', correo: 'luis@gmail.com',
    password: 'abcd', password2: 'abcd', direccion: 'Av. Siempre Viva 742', codigo: '',
    ...cambios,
  }
  await usuario.type(screen.getByLabelText('Nombre'), d.nombre)
  await usuario.type(screen.getByLabelText('Apellidos'), d.apellidos)
  await usuario.type(screen.getByLabelText('RUN'), d.run)
  await usuario.type(screen.getByLabelText('Correo'), d.correo)
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } })
  await usuario.type(screen.getByLabelText('Contraseña'), d.password)
  await usuario.type(screen.getByLabelText('Confirmar contraseña'), d.password2)
  await usuario.selectOptions(screen.getByLabelText('Región'), 'Valparaíso')
  await usuario.selectOptions(screen.getByLabelText('Comuna'), 'Viña del Mar')
  await usuario.type(screen.getByLabelText('Dirección'), d.direccion)
  if (d.codigo) await usuario.type(screen.getByLabelText(/Código de referido/), d.codigo)
}

describe('<Registro /> (formulario de registro)', () => {
  it('enviar vacío muestra los errores de cada campo obligatorio', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Los apellidos son obligatorios.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un RUN válido (ej: 123456785).')).toBeInTheDocument()
    expect(screen.getByText('Selecciona tu región.')).toBeInTheDocument()
    expect(screen.getByText('La dirección es obligatoria.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Registro de usuario' })).toBeInTheDocument()
  })

  it('la comuna empieza deshabilitada y se habilita al elegir la región', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro')
    expect(screen.getByLabelText('Comuna')).toBeDisabled()

    await usuario.selectOptions(screen.getByLabelText('Región'), 'Valparaíso')

    expect(screen.getByLabelText('Comuna')).toBeEnabled()
    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeInTheDocument()
  })

  it('con datos válidos crea la cuenta, inicia sesión y lleva al perfil', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro')
    await llenarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('¡Cuenta creada con éxito!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    const guardados = JSON.parse(window.localStorage.getItem('levelup_usuarios'))
    expect(guardados).toHaveLength(1)
    expect(guardados[0].correo).toBe('luis@gmail.com')
  })

  it('un correo institucional Duoc informa el 20 % de descuento', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro')
    await llenarFormulario(usuario, { correo: 'luis@duoc.cl' })
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText(/20% de descuento de por vida/, { selector: '.toast-msg' })).toBeInTheDocument()
  })

  it('un código de referido inexistente muestra error y no crea la cuenta', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro')
    await llenarFormulario(usuario, { codigo: 'ZZZZZZ' })
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Ese código de referido no existe.')).toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_usuarios')).not.toContain('luis@gmail.com')
  })

  it('un código de referido válido da puntos al nuevo usuario y a quien lo invitó', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro', { usuarios: [crearUsuario({ codigoReferido: 'AP1234' })] })
    await llenarFormulario(usuario, { codigo: 'ap1234' })
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText(/Ganaste 20 puntos Level-Up por usar un código de referido/)).toBeInTheDocument()
    const guardados = JSON.parse(window.localStorage.getItem('levelup_usuarios'))
    expect(guardados.find((u) => u.correo === 'ana@gmail.com').puntosLevelUp).toBe(50)
    expect(guardados.find((u) => u.correo === 'luis@gmail.com').puntosLevelUp).toBe(20)
  })

  it('rechaza un correo que ya está registrado', async () => {
    const usuario = userEvent.setup()
    abrirApp('/registro', { usuarios: [crearUsuario({ correo: 'luis@gmail.com' })] })
    await llenarFormulario(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText('Ya existe una cuenta registrada con ese correo.')).toBeInTheDocument()
  })
})
