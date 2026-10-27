import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { abrirApp } from '../test/utils.jsx'

describe('páginas informativas', () => {
  it('/blog muestra el artículo del aniversario', () => {
    abrirApp('/blog')
    expect(screen.getByRole('heading', { level: 1, name: 'Level-Up Gamer cumple 2 años' })).toBeInTheDocument()
  })

  it('/contacto muestra el formulario y los canales directos', () => {
    abrirApp('/contacto')
    expect(screen.getByRole('heading', { level: 1, name: 'Hablemos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument()
    expect(screen.getByText('Chatea por WhatsApp')).toHaveAttribute('href', 'https://wa.me/56900000000')
  })

  it('/registro muestra el formulario de alta', () => {
    abrirApp('/registro')
    expect(screen.getByRole('heading', { level: 1, name: 'Registro de usuario' })).toBeInTheDocument()
  })
})
