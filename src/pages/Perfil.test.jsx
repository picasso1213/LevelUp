import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearUsuario } from '../test/utils.jsx'

describe('<Perfil /> (perfil, fidelización y edición de datos)', () => {
  it('muestra los datos del usuario, su nivel y el progreso', () => {
    abrirApp('/perfil', conSesion(crearUsuario({ puntosLevelUp: 150 })))
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByText('Correo: ana@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('RUN: 123456785')).toBeInTheDocument()
    expect(screen.getByText('Plata')).toBeInTheDocument()
    expect(screen.getByText(/Te faltan 150 puntos para llegar a Oro/)).toBeInTheDocument()
  })

  it('un usuario Duoc ve la insignia de descuento', () => {
    abrirApp('/perfil', conSesion(crearUsuario({ esDuoc: true, descuento: 20 })))
    expect(screen.getByText('20% descuento Duoc de por vida')).toBeInTheDocument()
  })

  it('en el nivel máximo informa que no hay siguiente nivel', () => {
    abrirApp('/perfil', conSesion(crearUsuario({ puntosLevelUp: 2000 })))
    expect(screen.getByText('¡Alcanzaste el nivel máximo!')).toBeInTheDocument()
  })

  it('"Copiar" envía el código al portapapeles y avisa', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario()))
    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(screen.getByText('Código copiado al portapapeles')).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toBe('AP1234')
  })

  it('si el portapapeles falla, avisa que no se pudo copiar', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario()))
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('bloqueado'))
    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByText('No se pudo copiar el código')).toBeInTheDocument()
  })

  it('canjear descuenta los puntos y deshabilita lo que ya no alcanza', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario({ puntosLevelUp: 120 })))
    expect(screen.getByRole('button', { name: 'Canjear Cupón 10% de descuento' })).toBeDisabled()

    await usuario.click(screen.getByRole('button', { name: 'Canjear Cupón 5% de descuento' }))

    expect(screen.getByText(/Canjeaste "Cupón 5% de descuento"/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Canjear Cupón 5% de descuento' })).toBeDisabled()
    expect(JSON.parse(window.localStorage.getItem('levelup_usuarios'))[0].puntosLevelUp).toBe(20)
  })

  it('guardar cambios actualiza teléfono, dirección, ubicación y preferencias', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario()))

    await usuario.type(screen.getByLabelText('Teléfono'), ' +56 9 1111 2222 ')
    await usuario.clear(screen.getByLabelText('Dirección'))
    await usuario.type(screen.getByLabelText('Dirección'), 'Nueva 456')
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Coquimbo')
    await usuario.selectOptions(screen.getByLabelText('Comuna'), 'La Serena')
    await usuario.click(screen.getByLabelText('Mouse'))
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByText('Perfil actualizado')).toBeInTheDocument()
    const guardado = JSON.parse(window.localStorage.getItem('levelup_usuarios'))[0]
    expect(guardado).toMatchObject({
      telefono: '+56 9 1111 2222', direccion: 'Nueva 456', region: 'Coquimbo', comuna: 'La Serena', preferencias: ['Mouse'],
    })
  })

  it('desmarcar una preferencia la quita de la lista', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario({ preferencias: ['Mouse', 'Consolas'] })))
    const casilla = screen.getByLabelText('Mouse')
    expect(casilla).toBeChecked()
    await usuario.click(casilla)
    expect(casilla).not.toBeChecked()
  })

  it('"Cerrar sesión" termina la sesión y sale del perfil', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario()))
    const principal = screen.getByRole('main')
    await usuario.click(within(principal).getByRole('button', { name: 'Cerrar sesión' }))

    expect(screen.queryByRole('heading', { name: 'Mi perfil' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_sesion')).toBe('null')
  })

  it('el botón de cerrar sesión del encabezado también funciona', async () => {
    const usuario = userEvent.setup()
    abrirApp('/perfil', conSesion(crearUsuario()))
    const encabezado = screen.getByRole('banner')
    await usuario.click(within(encabezado).getByRole('button', { name: /cerrar sesión/i }))
    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument()
  })
})
