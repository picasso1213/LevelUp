import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioContacto from './FormularioContacto.jsx'

describe('<FormularioContacto />', () => {
  it('al enviar vacío muestra los errores de nombre, mensaje y términos', async () => {
    const usuario = userEvent.setup()
    render(<FormularioContacto />)

    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.getByText('El nombre completo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Cuéntanos en qué te podemos ayudar.')).toBeInTheDocument()
    expect(screen.getByText('Debes aceptar para que podamos contactarte.')).toBeInTheDocument()
    expect(screen.queryByText(/Gracias por tu mensaje/)).not.toBeInTheDocument()
  })

  it('valida el correo al salir del campo (blur)', async () => {
    const usuario = userEvent.setup()
    render(<FormularioContacto />)

    await usuario.type(screen.getByLabelText(/Correo electrónico/), 'ana@hotmail.com')
    await usuario.tab()

    expect(screen.getByText(/Usa un correo @duoc.cl/)).toBeInTheDocument()
  })

  it('cuenta los caracteres del mensaje mientras se escribe', async () => {
    const usuario = userEvent.setup()
    render(<FormularioContacto />)
    await usuario.type(screen.getByLabelText('Mensaje'), 'Hola')
    expect(screen.getByText('4/500')).toBeInTheDocument()
  })

  it('con datos válidos confirma el envío y limpia el formulario', async () => {
    const usuario = userEvent.setup()
    render(<FormularioContacto />)

    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Mensaje'), 'Quiero cotizar un PC')
    await usuario.click(screen.getByLabelText(/Acepto que Level-Up Gamer/))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.getByText(/Gracias por tu mensaje/)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
  })
})
