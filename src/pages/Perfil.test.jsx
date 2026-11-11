import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearUsuario } from '../test/utils.jsx'

// El perfil se carga desde el backend (GET /usuarios/me), por eso se espera con findBy*
const abrirPerfil = (usuario) => {
  const app = abrirApp('/perfil', conSesion(usuario))
  return { ...app, listo: screen.findByRole('heading', { name: 'Mi perfil' }) }
}

describe('<Perfil /> (perfil, fidelización y edición de datos)', () => {
  it('muestra los datos del usuario, su nivel y el progreso', async () => {
    const { listo } = abrirPerfil(crearUsuario({ puntosLevelUp: 150 }))
    await listo
    expect(screen.getByText('Correo: ana@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('RUN: 123456785')).toBeInTheDocument()
    expect(screen.getByText('Plata')).toBeInTheDocument()
    expect(screen.getByText(/Te faltan 150 puntos para llegar a Oro/)).toBeInTheDocument()
  })

  it('un usuario Duoc ve la insignia de descuento', async () => {
    const { listo } = abrirPerfil(crearUsuario({ esDuoc: true, descuento: 20 }))
    await listo
    expect(screen.getByText('20% descuento Duoc de por vida')).toBeInTheDocument()
  })

  it('en el nivel máximo informa que no hay siguiente nivel', async () => {
    const { listo } = abrirPerfil(crearUsuario({ puntosLevelUp: 2000 }))
    await listo
    expect(screen.getByText('¡Alcanzaste el nivel máximo!')).toBeInTheDocument()
  })

  it('"Copiar" envía el código al portapapeles y avisa', async () => {
    const usuario = userEvent.setup()
    const { listo } = abrirPerfil(crearUsuario())
    await listo
    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(screen.getByText('Código copiado al portapapeles')).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toBe('AP1234')
  })

  it('si el portapapeles falla, avisa que no se pudo copiar', async () => {
    const usuario = userEvent.setup()
    const { listo } = abrirPerfil(crearUsuario())
    await listo
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('bloqueado'))
    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByText('No se pudo copiar el código')).toBeInTheDocument()
  })

  it('canjear descuenta los puntos en el backend y deshabilita lo que ya no alcanza', async () => {
    const usuario = userEvent.setup()
    const { listo, api } = abrirPerfil(crearUsuario({ puntosLevelUp: 120 }))
    await listo
    expect(screen.getByRole('button', { name: 'Canjear Cupón 10% de descuento' })).toBeDisabled()

    await usuario.click(screen.getByRole('button', { name: 'Canjear Cupón 5% de descuento' }))

    expect(await screen.findByText(/Canjeaste "Cupón 5% de descuento"/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Canjear Cupón 5% de descuento' })).toBeDisabled()
    expect(api.estado.usuarios[0].puntosLevelUp).toBe(20)
  })

  it('guardar cambios envía teléfono, dirección, ubicación y preferencias al backend', async () => {
    const usuario = userEvent.setup()
    const { listo, api } = abrirPerfil(crearUsuario())
    await listo

    await usuario.type(screen.getByLabelText('Teléfono'), ' +56 9 1111 2222 ')
    await usuario.clear(screen.getByLabelText('Dirección'))
    await usuario.type(screen.getByLabelText('Dirección'), 'Nueva 456')
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Coquimbo')
    await usuario.selectOptions(screen.getByLabelText('Comuna'), 'La Serena')
    await usuario.click(await screen.findByLabelText('Mouse')) // las categorías vienen del catálogo
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Perfil actualizado')).toBeInTheDocument()
    expect(api.estado.usuarios[0]).toMatchObject({
      telefono: '+56 9 1111 2222', direccion: 'Nueva 456', region: 'Coquimbo', comuna: 'La Serena', preferencias: ['Mouse'],
    })
  })

  it('desmarcar una preferencia la quita de la lista', async () => {
    const usuario = userEvent.setup()
    const { listo } = abrirPerfil(crearUsuario({ preferencias: ['Mouse', 'Consolas'] }))
    await listo
    const casilla = await screen.findByLabelText('Mouse')
    expect(casilla).toBeChecked()
    await usuario.click(casilla)
    expect(casilla).not.toBeChecked()
  })

  it('"Cerrar sesión" borra el token y sale del perfil', async () => {
    const usuario = userEvent.setup()
    const { listo } = abrirPerfil(crearUsuario())
    await listo
    const principal = screen.getByRole('main')
    await usuario.click(within(principal).getByRole('button', { name: 'Cerrar sesión' }))

    expect(screen.queryByRole('heading', { name: 'Mi perfil' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_token')).toBeNull()
  })

  it('el botón de cerrar sesión del encabezado también funciona', async () => {
    const usuario = userEvent.setup()
    const { listo } = abrirPerfil(crearUsuario())
    await listo
    const encabezado = screen.getByRole('banner')
    await usuario.click(within(encabezado).getByRole('button', { name: /cerrar sesión/i }))
    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument()
  })

  it('si el token guardado ya no sirve (401) se descarta y se pide iniciar sesión', async () => {
    abrirApp('/perfil', { usuarios: [], sesion: { correo: 'fantasma@gmail.com' } })
    expect(await screen.findByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
    expect(window.localStorage.getItem('levelup_token')).toBeNull()
  })
})
