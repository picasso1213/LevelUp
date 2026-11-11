import { useCallback, useState } from 'react'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import CampoFormulario from '../components/atoms/CampoFormulario.jsx'
import EstadoCatalogo from '../components/molecules/EstadoCatalogo.jsx'
import ModalConfirmar from '../components/molecules/ModalConfirmar.jsx'
import { useApi } from '../hooks/useApi.js'
import { useProductos } from '../context/ProductosContext.jsx'
import { useSesion } from '../context/SesionContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { actualizarProducto, crearProducto, eliminarProducto, listarCategorias } from '../services/productos.js'
import { formatearPrecio } from '../utils/formato.js'

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', imagen: '', categoriaId: '' }

// CRUD de productos. Todos los roles del panel ven la lista; solo ADMIN crea, edita y elimina
// (el backend lo exige con 403 aunque alguien intente saltarse la interfaz).
function PanelProductos() {
  const { usuarioActual } = useSesion()
  const esAdmin = usuarioActual?.rol === 'ADMIN'
  const { productos, cargando, error, recargar } = useProductos()
  const { datos: categorias } = useApi(useCallback(() => listarCategorias(), []), [])
  const { mostrarToast } = useToast()

  const [editando, setEditando] = useState(null) // null = cerrado; { id?, ...campos } = abierto
  const [errores, setErrores] = useState({})
  const [aEliminar, setAEliminar] = useState(null)

  const abrirNuevo = () => { setErrores({}); setEditando({ ...VACIO }) }
  const abrirEdicion = (p) => {
    setErrores({})
    setEditando({
      id: p.id, nombre: p.nombre, descripcion: p.descripcion || '', precio: String(p.precio),
      stock: String(p.stock), imagen: p.imagen || '', categoriaId: String(p.categoriaId),
    })
  }
  const cambiar = (campo) => (e) => setEditando({ ...editando, [campo]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    const nuevos = {}
    if (!editando.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.'
    if (editando.precio === '' || Number(editando.precio) < 0) nuevos.precio = 'Ingresa un precio válido.'
    if (editando.stock === '' || Number(editando.stock) < 0) nuevos.stock = 'Ingresa un stock válido.'
    if (!editando.categoriaId) nuevos.categoriaId = 'Selecciona una categoría.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const cuerpo = {
      nombre: editando.nombre.trim(),
      descripcion: editando.descripcion.trim(),
      precio: Number(editando.precio),
      stock: Number(editando.stock),
      imagen: editando.imagen.trim(),
      categoriaId: Number(editando.categoriaId),
    }
    try {
      if (editando.id) await actualizarProducto(editando.id, cuerpo)
      else await crearProducto(cuerpo)
      mostrarToast(editando.id ? 'Producto actualizado' : 'Producto creado')
      setEditando(null)
      recargar()
    } catch (err) {
      if (err.campos && Object.keys(err.campos).length > 0) setErrores(err.campos)
      else mostrarToast(err.message)
    }
  }

  async function eliminar() {
    const producto = aEliminar
    setAEliminar(null)
    try {
      await eliminarProducto(producto.id)
      mostrarToast('Producto eliminado')
      recargar()
    } catch (err) {
      mostrarToast(err.message)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos</h2>
        {esAdmin && <Button type="button" variant="accent-green" onClick={abrirNuevo}>Nuevo producto</Button>}
      </div>

      <EstadoCatalogo cargando={cargando} error={error} onReintentar={recargar} />

      {!cargando && !error && (
        <div className="table-responsive">
          <Table striped hover variant="dark" className="align-middle">
            <caption className="visually-hidden">Lista de productos</caption>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th>{esAdmin && <th>Acciones</th>}</tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{formatearPrecio(p.precio)}</td>
                  <td>{p.stock}</td>
                  {esAdmin && (
                    <td className="d-flex gap-2">
                      <Button type="button" size="sm" variant="outline-accent" aria-label={`Editar ${p.nombre}`} onClick={() => abrirEdicion(p)}>Editar</Button>
                      <Button type="button" size="sm" variant="danger" aria-label={`Eliminar ${p.nombre}`} onClick={() => setAEliminar(p)}>Eliminar</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={Boolean(editando)} onHide={() => setEditando(null)} centered>
        {editando && (
          <Form noValidate onSubmit={guardar}>
            <Modal.Header closeButton>
              <Modal.Title>{editando.id ? 'Editar producto' : 'Nuevo producto'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <CampoFormulario id="prod-nombre" label="Nombre" maxLength={150} value={editando.nombre} onChange={cambiar('nombre')} error={errores.nombre} />
              <CampoFormulario id="prod-descripcion" label="Descripción" maxLength={500} value={editando.descripcion} onChange={cambiar('descripcion')} error={errores.descripcion} />
              <Form.Group className="mb-3" controlId="prod-categoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select value={editando.categoriaId} onChange={cambiar('categoriaId')} isInvalid={Boolean(errores.categoriaId)}>
                  <option value="">Selecciona…</option>
                  {(categorias || []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errores.categoriaId}</Form.Control.Feedback>
              </Form.Group>
              <CampoFormulario id="prod-precio" label="Precio (CLP)" type="number" min={0} value={editando.precio} onChange={cambiar('precio')} error={errores.precio} />
              <CampoFormulario id="prod-stock" label="Stock" type="number" min={0} value={editando.stock} onChange={cambiar('stock')} error={errores.stock} />
              <CampoFormulario id="prod-imagen" label="Imagen (ruta)" placeholder="/images/ps5.jpg" value={editando.imagen} onChange={cambiar('imagen')} error={errores.imagen} />
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="outline-accent" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button type="submit" variant="accent-blue">Guardar</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      <ModalConfirmar
        mostrar={Boolean(aEliminar)}
        titulo="Eliminar producto"
        mensaje={`¿Seguro que quieres eliminar "${aEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={eliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}

export default PanelProductos
