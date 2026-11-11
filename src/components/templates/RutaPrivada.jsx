import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Alert, Container } from 'react-bootstrap'

// Ruta protegida:
//  - mientras se valida el token guardado (cargando) no decide nada, así no te manda a /login al recargar;
//  - sin sesión redirige a /login y recuerda a qué página se quería entrar (state.desde);
//  - con `roles`, solo entra quien tiene uno de esos roles (ej: ['ADMIN', 'VENDEDOR']).
// `replace` evita que el botón "Atrás" vuelva a la página protegida.
function RutaPrivada({ autenticado, cargando = false, roles, rol }) {
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <Container className="panel">
        <p className="text-secondary" role="status">Cargando…</p>
      </Container>
    )
  }
  if (!autenticado) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  if (roles && !roles.includes(rol)) {
    return (
      <section className="panel">
        <Container>
          <Alert variant="warning" role="alert">No tienes permiso para ver esta página.</Alert>
        </Container>
      </section>
    )
  }
  return <Outlet />
}

export default RutaPrivada
