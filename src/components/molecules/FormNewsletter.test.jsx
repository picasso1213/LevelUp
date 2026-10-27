import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormNewsletter from './FormNewsletter.jsx'

describe('<FormNewsletter />', () => {
  it('con el campo vacío pide un correo válido', async () => {
    const usuario = userEvent.setup()
    render(<FormNewsletter />)
    await usuario.click(screen.getByRole('button', { name: 'Suscribirme' }))
    expect(screen.getByRole('status')).toHaveTextContent('Ingresa un correo electrónico válido.')
  })

  it('con un correo mal escrito muestra el error', async () => {
    const usuario = userEvent.setup()
    render(<FormNewsletter />)
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'no-es-un-correo')
    await usuario.click(screen.getByRole('button', { name: 'Suscribirme' }))
    expect(screen.getByRole('status')).toHaveClass('error')
  })

  it('con un correo válido confirma y limpia el campo', async () => {
    const usuario = userEvent.setup()
    render(<FormNewsletter />)
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: 'Suscribirme' }))
    expect(screen.getByRole('status')).toHaveTextContent('¡Listo! Te avisaremos de nuestras novedades.')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('')
  })
})
