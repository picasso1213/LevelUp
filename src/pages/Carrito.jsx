import { useMemo } from 'react'
import EnlaceBoton from '../components/atoms/EnlaceBoton.jsx'
import { Container, Button } from 'react-bootstrap'
import TablaCarrito from '../components/organisms/TablaCarrito.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { calcularTotales, detalleCarrito } from '../utils/carrito.js'
import { formatearPrecio } from '../utils/formato.js'

function Carrito() {
  const { carrito, productos, cambiar, quitar, vaciar } = useCarrito()
  const { usuarioActual, registrarCompra } = useSesion()
  const { mostrarToast } = useToast()

  const descuentoPct = usuarioActual ? usuarioActual.descuento : 0
  const lineas = useMemo(() => detalleCarrito(carrito, productos), [carrito, productos])
  const totales = calcularTotales(lineas, descuentoPct)

  function pagar() {
    if (lineas.length === 0) return
    let mensaje = '¡Gracias por tu compra!'
    if (usuarioActual) {
      registrarCompra(lineas, totales.total, totales.puntos)
      mensaje += ` Ganaste ${totales.puntos} puntos Level-Up.`
    }
    vaciar()
    mostrarToast(mensaje)
  }

  if (lineas.length === 0) {
    return (
      <section className="panel panel-tight">
        <Container>
          <h1>Tu carrito</h1>
          <div className="text-center py-4">
            <p className="text-secondary">Tu carrito está vacío por ahora.</p>
            <EnlaceBoton pagina="productos">Ver productos</EnlaceBoton>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="panel panel-tight">
      <Container>
        <h1>Tu carrito</h1>
        <TablaCarrito lineas={lineas} onCambiarCantidad={cambiar} onQuitar={quitar} />

        <div className="carrito-resumen">
          <Button type="button" variant="outline-accent" onClick={() => { vaciar(); mostrarToast('Carrito vaciado') }}>Vaciar carrito</Button>

          <div className="carrito-total-box"><span>Subtotal:</span><span className="carrito-total">{formatearPrecio(totales.subtotal)}</span></div>
          {descuentoPct > 0 && (
            <div className="carrito-total-box">
              <span>Descuento Duoc ({descuentoPct}%):</span>
              <span className="carrito-total">-{formatearPrecio(totales.descuento)}</span>
            </div>
          )}
          <div className="carrito-total-box"><span>Total:</span><span className="carrito-total">{formatearPrecio(totales.total)}</span></div>

          <p className="text-secondary" style={{ fontSize: '.85rem' }}>
            {usuarioActual
              ? `Ganarás ${totales.puntos} puntos Level-Up con esta compra.`
              : 'Inicia sesión para ganar puntos Level-Up con tus compras.'}
          </p>
          <Button type="button" variant="accent-green" onClick={pagar}>Proceder al pago</Button>
        </div>
      </Container>
    </section>
  )
}

export default Carrito
