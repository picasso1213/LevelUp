import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

// Prueba de integración: la aplicación completa con su tabla de rutas.
// MemoryRouter permite "abrir" una URL sin navegador.
const abrir = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )

describe('<App /> y sus rutas', () => {
  it('"/" muestra la portada', () => {
    abrir('/')
    expect(screen.getByRole('heading', { level: 1, name: /Sube de nivel/ })).toBeInTheDocument()
  })

  it('/productos/:id usa useParams y muestra ese producto', () => {
    abrir('/productos/5')
    expect(screen.getByRole('heading', { level: 1, name: /Mouse Logitech/ })).toBeInTheDocument()
  })

  it('un id inexistente muestra un aviso en vez de romper', () => {
    abrir('/productos/999')
    expect(screen.getByText(/No encontramos ese producto/)).toBeInTheDocument()
  })

  it('/productos?categoria=Mouse usa useLocation y filtra por categoría', () => {
    abrir('/productos?categoria=Mouse')
    expect(screen.getByRole('heading', { name: 'Mouse Logitech G502 HERO' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'PlayStation 5' })).not.toBeInTheDocument()
  })

  it('una ruta que no existe muestra la página 404', () => {
    abrir('/no-existe')
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument()
  })

  it('/perfil sin sesión redirige al login (ruta protegida)', () => {
    abrir('/perfil')
    expect(screen.getByRole('heading', { name: 'Inicio de sesión' })).toBeInTheDocument()
  })

  it('navegar con el menú cambia de página sin recargar', async () => {
    const usuario = userEvent.setup()
    abrir('/')
    await usuario.click(screen.getAllByRole('link', { name: 'Nosotros' })[0])
    expect(screen.getByRole('heading', { level: 1, name: 'Quiénes somos' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Sube de nivel/ })).not.toBeInTheDocument()
  })
})
