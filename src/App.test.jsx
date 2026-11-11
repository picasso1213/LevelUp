import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearUsuario } from './test/utils.jsx'

// Prueba de integración: la aplicación completa con su tabla de rutas y un backend falso.
// abrirApp usa MemoryRouter, que permite "abrir" una URL sin navegador.
describe('<App /> y sus rutas', () => {
  it('"/" muestra la portada', () => {
    abrirApp('/')
    expect(screen.getByRole('heading', { level: 1, name: /Sube de nivel/ })).toBeInTheDocument()
  })

  it('la portada carga los productos desde el backend', async () => {
    abrirApp('/')
    expect(await screen.findByRole('heading', { name: 'PlayStation 5' })).toBeInTheDocument()
  })

  it('si el backend no responde muestra un aviso y "Reintentar" vuelve a cargar el catálogo', async () => {
    const usuario = userEvent.setup()
    abrirApp('/productos', { primeraPeticionFalla: true })
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')

    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { name: 'PlayStation 5' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('/productos/:id usa useParams y muestra ese producto', async () => {
    abrirApp('/productos/5')
    expect(await screen.findByRole('heading', { level: 1, name: /Mouse Logitech/ })).toBeInTheDocument()
  })

  it('un id inexistente muestra un aviso en vez de romper', async () => {
    abrirApp('/productos/999')
    expect(await screen.findByText(/No encontramos ese producto/)).toBeInTheDocument()
  })

  it('/productos?categoria=Mouse usa useLocation y filtra por categoría', async () => {
    abrirApp('/productos?categoria=Mouse')
    expect(await screen.findByRole('heading', { name: 'Mouse Logitech G502 HERO' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'PlayStation 5' })).not.toBeInTheDocument()
  })

  it('una ruta que no existe muestra la página 404', () => {
    abrirApp('/no-existe')
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument()
  })

  it('/perfil sin sesión redirige al login (ruta protegida)', () => {
    abrirApp('/perfil')
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
  })

  it('navegar con el menú cambia de página sin recargar', async () => {
    const usuario = userEvent.setup()
    abrirApp('/')
    await usuario.click(screen.getAllByRole('link', { name: 'Nosotros' })[0])
    expect(screen.getByRole('heading', { level: 1, name: 'Quiénes somos' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Sube de nivel/ })).not.toBeInTheDocument()
  })

  describe('rutas por rol', () => {
    it('/panel sin sesión redirige al login', () => {
      abrirApp('/panel/productos')
      expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
    })

    it('un CLIENTE no puede entrar al panel', async () => {
      abrirApp('/panel/productos', conSesion(crearUsuario()))
      expect(await screen.findByText('No tienes permiso para ver esta página.')).toBeInTheDocument()
    })

    it('un VENDEDOR ve productos y órdenes, pero no la pestaña de usuarios', async () => {
      abrirApp('/panel/productos', conSesion(crearUsuario({ rol: 'VENDEDOR' })))
      expect(await screen.findByRole('heading', { name: 'Panel de gestión' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Órdenes' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
    })

    it('un VENDEDOR que escribe /panel/usuarios en la URL recibe "sin permiso"', async () => {
      abrirApp('/panel/usuarios', conSesion(crearUsuario({ rol: 'VENDEDOR' })))
      expect(await screen.findByText('No tienes permiso para ver esta página.')).toBeInTheDocument()
    })

    it('un ADMIN ve las tres pestañas y el enlace "Panel" del menú', async () => {
      abrirApp('/panel/productos', conSesion(crearUsuario({ rol: 'ADMIN' })))
      expect(await screen.findByRole('link', { name: 'Usuarios' })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: 'Panel' }).length).toBeGreaterThanOrEqual(1)
    })
  })
})
