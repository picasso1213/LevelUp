import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearBoleta, crearUsuario } from '../../test/utils.jsx'

describe('<ResenasProducto />', () => {
  it('sin reseñas muestra el mensaje inicial y pide iniciar sesión', async () => {
    abrirApp('/productos/5')
    expect(await screen.findByText('Este producto todavía no tiene reseñas.')).toBeInTheDocument()
    expect(screen.getByText('Sé el primero en dejar tu opinión.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'iniciar sesión' })).toBeInTheDocument()
  })

  it('un usuario que no compró el producto no puede reseñar', async () => {
    abrirApp('/productos/5', conSesion(crearUsuario()))
    expect(await screen.findByText(/Solo los clientes que compraron este producto/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Publicar reseña' })).not.toBeInTheDocument()
  })

  it('quien compró el producto (según sus boletas del backend) publica una reseña y aparece en la lista', async () => {
    const usuario = userEvent.setup()
    abrirApp('/productos/5', conSesion(crearUsuario(), { boletas: [crearBoleta()] }))

    const publicar = await screen.findByRole('button', { name: 'Publicar reseña' })
    await usuario.click(publicar) // vacío: no hace nada
    expect(screen.queryByText('¡Gracias por tu reseña!')).not.toBeInTheDocument()

    await usuario.selectOptions(screen.getByLabelText('Calificación'), '4')
    await usuario.type(screen.getByLabelText('Comentario'), 'Muy buen mouse')
    await usuario.click(screen.getByRole('button', { name: 'Publicar reseña' }))

    expect(screen.getByText('¡Gracias por tu reseña!')).toBeInTheDocument()
    expect(screen.getByText('Muy buen mouse')).toBeInTheDocument()
    expect(screen.getByText('Ana P.')).toBeInTheDocument()
    expect(screen.getByText('(1 reseña)')).toBeInTheDocument()
    expect(screen.getByText(/Ya dejaste una reseña/)).toBeInTheDocument()
  })

  it('muestra el promedio y las reseñas existentes, la más reciente primero', async () => {
    const resenas = [
      { id: 1, productoId: 5, correoUsuario: 'a@gmail.com', nombreUsuario: 'Bea R.', calificacion: 5, comentario: 'Antigua', fecha: '2026-01-01T00:00:00.000Z' },
      { id: 2, productoId: 5, correoUsuario: 'b@gmail.com', nombreUsuario: 'Caro S.', calificacion: 3, comentario: 'Reciente', fecha: '2026-03-01T00:00:00.000Z' },
    ]
    abrirApp('/productos/5', { resenas })
    expect(await screen.findByText('4.0')).toBeInTheDocument()
    expect(screen.getByText('(2 reseñas)')).toBeInTheDocument()
    const textos = screen.getAllByText(/Antigua|Reciente/).map((n) => n.textContent)
    expect(textos).toEqual(['Reciente', 'Antigua'])
  })
})
