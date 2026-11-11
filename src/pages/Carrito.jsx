import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnlaceBoton from '../components/atoms/EnlaceBoton.jsx'
import { Container, Button } from 'react-bootstrap'
import TablaCarrito from '../components/organisms/TablaCarrito.jsx'
import EstadoCatalogo from '../components/molecules/EstadoCatalogo.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useProductos } from '../context/ProductosContext.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { calcularTotales, detalleCarrito } from '../utils/carrito.js'
import { formatearPrecio } from '../utils/formato.js'

function Carrito() {
  const { carrito, productos, cambiar, quitar, vaciar } = useCarrito()
  const { cargando, error, recargar } = useProductos()
  const { usuarioActual, registrarCompra } = useSesion()
  const { mostrarToast } = useToast()
  const navigate = useNavigate()
  const [pagando, setPagando] = useState(false)

  const descuentoPct = usuarioActual ? usuarioActual.descuento : 0
  const lineas = useMemo(() => detalleCarrito(carrito, productos), [carrito, productos])
  const totales = calcularTotales(lineas, descuentoPct)

  // La compra se registra en el backend (boleta). Hace falta una cuenta: la boleta queda a nombre del usuario.
  async function pagar() {
    if (lineas.length === 0 || pagando) return
    if (!usuarioActual) {
      mostrarToast('Inicia sesión para completar tu compra')
      navigate('/login', { state: { desde: '/carrito' } })
      return
    }
    setPagando(true)
    try {
      const boleta = await registrarCompra(lineas)
      vaciar()
      await recargar() // el servidor descontó el stock
      mostrarToast(`¡Gracias por tu compra! Ganaste ${boleta.puntosGanados} puntos Level-Up.`)
    } catch (e) {
      mostrarToast(e.message) // ej: "Stock insuficiente para ..."
    } finally {
      setPagando(false)
    }
  }

  if (lineas.length === 0) {
    return (
      <section className="panel panel-tight">
        <Container>
          <h1>Tu carrito</h1>
          <EstadoCatalogo cargando={cargando} error={error} onReintentar={recargar} />
          {!cargando && !error && (
            <div className="text-center py-4">
              <p className="text-secondary">Tu carrito está vacío por ahora.</p>
              <EnlaceBoton pagina="productos">Ver productos</EnlaceBoton>
            </div>
          )}
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
              : 'Inicia sesión para pagar y ganar puntos Level-Up con tus compras.'}
          </p>
          <Button type="button" variant="accent-green" disabled={pagando} onClick={pagar}>Proceder al pago</Button>
        </div>
      </Container>
    </section>
  )
}

export default Carrito
