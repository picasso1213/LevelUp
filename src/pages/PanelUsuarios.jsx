import { useState } from 'react'
import { Button, Form, Table } from 'react-bootstrap'
import EstadoCatalogo from '../components/molecules/EstadoCatalogo.jsx'
import ModalConfirmar from '../components/molecules/ModalConfirmar.jsx'
import { useApi } from '../hooks/useApi.js'
import { useSesion } from '../context/SesionContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { cambiarRol, eliminarUsuario, listarUsuarios } from '../services/usuarios.js'

const ROLES = ['ADMIN', 'VENDEDOR', 'CLIENTE']

// Gestión de usuarios (solo ADMIN): cambiar rol y eliminar. No puedes modificar tu propia cuenta.
function PanelUsuarios() {
  const { usuarioActual } = useSesion()
  const { datos: usuarios, cargando, error, recargar } = useApi(listarUsuarios, [])
  const { mostrarToast } = useToast()
  const [aEliminar, setAEliminar] = useState(null)

  async function cambiar(usuario, rol) {
    try {
      await cambiarRol(usuario.id, rol)
      mostrarToast(`Rol de ${usuario.nombre} actualizado`)
    } catch (e) {
      mostrarToast(e.message)
    }
    recargar()
  }

  async function eliminar() {
    const usuario = aEliminar
    setAEliminar(null)
    try {
      await eliminarUsuario(usuario.id)
      mostrarToast('Usuario eliminado')
    } catch (e) {
      mostrarToast(e.message)
    }
    recargar()
  }

  return (
    <>
      <h2>Usuarios</h2>
      <EstadoCatalogo cargando={cargando} error={error} onReintentar={recargar} />

      {!cargando && !error && (
        <div className="table-responsive">
          <Table striped hover variant="dark" className="align-middle">
            <caption className="visually-hidden">Lista de usuarios</caption>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Puntos</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esYo = u.id === usuarioActual?.id
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre} {u.apellidos}</td>
                    <td>{u.correo}</td>
                    <td>
                      <Form.Select size="sm" aria-label={`Rol de ${u.nombre}`} value={u.rol} disabled={esYo}
                        onChange={(e) => cambiar(u, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Form.Select>
                    </td>
                    <td>{u.puntosLevelUp}</td>
                    <td>
                      <Button type="button" size="sm" variant="danger" disabled={esYo}
                        aria-label={`Eliminar a ${u.nombre}`} onClick={() => setAEliminar(u)}>Eliminar</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      <ModalConfirmar
        mostrar={Boolean(aEliminar)}
        titulo="Eliminar usuario"
        mensaje={`¿Seguro que quieres eliminar a ${aEliminar?.nombre} ${aEliminar?.apellidos}?`}
        onConfirmar={eliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}

export default PanelUsuarios
