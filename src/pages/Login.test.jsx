import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, crearUsuario } from '../test/utils.jsx'

describe('<Login /> (formulario de inicio de sesión)', () => {
  it('con credenciales incorrectas muestra el error y no inicia sesión', async () => {
    const usuario = userEvent.setup()
    abrirApp('/login', { usuarios: [crearUsuario()] })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@gmail.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'mala')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
  })

  it('con credenciales correctas inicia sesión y abre el perfil', async () => {
    const usuario = userEvent.setup()
    abrirApp('/login', { usuarios: [crearUsuario()] })
    await usuario.type(screen.getByLabelText('Correo'), 'ANA@gmail.com')
    await usuario.type(screen.getByLabelText('Contraseña'), '1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('Sesión iniciada')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
  })

  it('al entrar a /perfil sin sesión, tras iniciar sesión vuelve a /perfil', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', { usuarios: [crearUsuario()] })
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Correo'), 'ana@gmail.com')
    await usuario.type(screen.getByLabelText('Contraseña'), '1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
  })
})
