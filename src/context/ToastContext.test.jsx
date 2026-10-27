import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext.jsx'

function Disparador() {
  const { mostrarToast } = useToast()
  return <button onClick={() => mostrarToast('Producto añadido')}>avisar</button>
}

describe('ToastProvider', () => {
  it('muestra el aviso y lo oculta solo a los 2,2 segundos (TEMPORIZADORES FALSOS)', () => {
    vi.useFakeTimers()
    render(<ToastProvider><Disparador /></ToastProvider>)
    const aviso = screen.getByRole('status')

    act(() => screen.getByText('avisar').click())
    expect(aviso).toHaveTextContent('Producto añadido')
    expect(aviso).toHaveClass('show')

    act(() => vi.advanceTimersByTime(2200))
    expect(aviso).not.toHaveClass('show')
    expect(aviso).toBeEmptyDOMElement()
  })

  it('useToast fuera del proveedor lanza un error claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}) // silencia el ruido de React
    expect(() => render(<Disparador />)).toThrow('useToast debe usarse dentro de <ToastProvider>')
  })
})
