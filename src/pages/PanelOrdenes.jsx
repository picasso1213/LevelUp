import { Fragment, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import EstadoCatalogo from '../components/molecules/EstadoCatalogo.jsx'
import { useApi } from '../hooks/useApi.js'
import { listarBoletas } from '../services/boletas.js'
import { formatearFecha } from '../utils/fecha.js'
import { formatearPrecio } from '../utils/formato.js'

// Órdenes (boletas) de todos los clientes. Disponible para ADMIN y VENDEDOR; solo lectura.
function PanelOrdenes() {
  const { datos: boletas, cargando, error, recargar } = useApi(listarBoletas, [])
  const [abierta, setAbierta] = useState(null)

  return (
    <>
      <h2>Órdenes</h2>
      <EstadoCatalogo cargando={cargando} error={error} onReintentar={recargar} />

      {!cargando && !error && boletas.length === 0 && <p className="text-secondary">Aún no hay órdenes.</p>}

      {!cargando && !error && boletas.length > 0 && (
        <div className="table-responsive">
          <Table striped hover variant="dark" className="align-middle">
            <caption className="visually-hidden">Lista de órdenes</caption>
            <thead>
              <tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Puntos</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {boletas.map((b) => (
                <Fragment key={b.id}>
                  <tr>
                    <td>{b.id}</td>
                    <td>{formatearFecha(b.fecha)}</td>
                    <td>{b.usuarioNombre}<br /><small className="text-secondary">{b.usuarioCorreo}</small></td>
                    <td>{formatearPrecio(b.total)}</td>
                    <td>{b.puntosGanados}</td>
                    <td>
                      <Button type="button" size="sm" variant="outline-accent" aria-expanded={abierta === b.id}
                        onClick={() => setAbierta(abierta === b.id ? null : b.id)}>
                        {abierta === b.id ? 'Ocultar' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                  {abierta === b.id && (
                    <tr>
                      <td colSpan={6}>
                        <ul className="mb-1">
                          {b.detalles.map((d) => (
                            <li key={d.productoId}>{d.cantidad} × {d.productoNombre} — {formatearPrecio(d.subtotal)}</li>
                          ))}
                        </ul>
                        <small className="text-secondary">
                          Subtotal {formatearPrecio(b.subtotal)} · Descuento {formatearPrecio(b.descuento)}
                        </small>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  )
}

export default PanelOrdenes
