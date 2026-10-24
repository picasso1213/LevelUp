import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FiltrosProductos from './FiltrosProductos.jsx'
import { FILTROS_INICIALES } from '../../utils/productos.js'

describe('<FiltrosProductos />', () => {
  it('es un formulario controlado: refleja los valores recibidos por props', () => {
    render(
      <FiltrosProductos filtros={{ ...FILTROS_INICIALES, busqueda: 'mouse', soloStock: true }}
        categorias={['Mouse']} onCambiar={vi.fn()} onLimpiar={vi.fn()} />,
    )
    expect(screen.getByLabelText('Buscar')).toHaveValue('mouse')
    expect(screen.getByLabelText('Solo con stock disponible')).toBeChecked()
  })

  it('al elegir una categoría llama a onCambiar con los filtros actualizados', async () => {
    const usuario = userEvent.setup()
    const onCambiar = vi.fn()
    render(<FiltrosProductos filtros={FILTROS_INICIALES} categorias={['Consolas', 'Mouse']} onCambiar={onCambiar} onLimpiar={vi.fn()} />)

    await usuario.selectOptions(screen.getByLabelText('Categoría'), 'Mouse')

    expect(onCambiar).toHaveBeenCalledWith({ ...FILTROS_INICIALES, categoria: 'Mouse' })
  })

  it('el botón Limpiar llama a onLimpiar', async () => {
    const usuario = userEvent.setup()
    const onLimpiar = vi.fn()
    render(<FiltrosProductos filtros={FILTROS_INICIALES} categorias={[]} onCambiar={vi.fn()} onLimpiar={onLimpiar} />)
    await usuario.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onLimpiar).toHaveBeenCalledTimes(1)
  })
})
