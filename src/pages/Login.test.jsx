import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, crearUsuario } from '../test/utils.jsx'

async function iniciar(usuario, correo, password) {
  await usuario.type(screen.getByLabelText('Correo'), correo)
  await usuario.type(screen.getByLabelText('Contraseña'), password)
  await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('<Login /> (formulario de inicio de sesión)', () => {
  it('con credenciales incorrectas muestra el error del servidor y no inicia sesión', async () => {
    const usuario = userEvent.setup()
    abrirApp('/login', { usuarios: [crearUsuario()] })
    await iniciar(usuario, 'ana@gmail.com', 'mala')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_token')).toBeNull()
  })

  it('con credenciales correctas guarda el token y abre el perfil', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/login', { usuarios: [crearUsuario()] })
    await iniciar(usuario, 'ANA@gmail.com', '1234')

    expect(await screen.findByText('Sesión iniciada')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_token')).toBe('tok:ana@gmail.com')
    expect(api.estado.peticiones.find((p) => p.ruta === '/auth/login').cuerpo).toEqual({ correo: 'ANA@gmail.com', password: '1234' })
  })

  it('al entrar a /perfil sin sesión, tras iniciar sesión vuelve a /perfil', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', { usuarios: [crearUsuario()] })
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()

    await iniciar(usuario, 'ana@gmail.com', '1234')

    expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
  })

  it('un ADMIN entra directo al panel de gestión', async () => {
    const usuario = userEvent.setup()
    abrirApp('/login', { usuarios: [crearUsuario({ correo: 'admin@levelup.cl', rol: 'ADMIN' })] })
    await iniciar(usuario, 'admin@levelup.cl', '1234')

    expect(await screen.findByRole('heading', { name: 'Panel de gestión' })).toBeInTheDocument()
  })
})
