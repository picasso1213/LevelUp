import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import RutaPrivada from './RutaPrivada.jsx'

function Login() {
  const { state } = useLocation()
  return <p>pantalla login (desde: {state?.desde})</p>
}

const dibujar = (autenticado) =>
  render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RutaPrivada autenticado={autenticado} />}>
          <Route path="/perfil" element={<p>contenido privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('<RutaPrivada />', () => {
  it('sin sesión redirige a /login y recuerda la página pedida', () => {
    dibujar(false)
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
    expect(screen.getByText('pantalla login (desde: /perfil)')).toBeInTheDocument()
  })

  it('con sesión muestra la ruta hija', () => {
    dibujar(true)
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})
