import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { SesionProvider, useSesion } from './context/SesionContext.jsx'
import { ResenasProvider } from './context/ResenasContext.jsx'
import Layout from './components/templates/Layout.jsx'
import RutaPrivada from './components/templates/RutaPrivada.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'
import Carrito from './pages/Carrito.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Perfil from './pages/Perfil.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Blog from './pages/Blog.jsx'
import Contacto from './pages/Contacto.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'

// Tabla de rutas (React Router). Todas viven dentro de <Layout>, que dibuja el encabezado y el pie
// y, en su <Outlet />, la página que corresponde a la URL.
function Rutas() {
  const { usuarioActual } = useSesion()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<DetalleProducto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contacto" element={<Contacto />} />

        {/* Ruta protegida: solo entra quien tiene sesión */}
        <Route element={<RutaPrivada autenticado={Boolean(usuarioActual)} />}>
          <Route path="perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

// App = proveedores de estado global + las rutas. El <BrowserRouter> está en main.jsx
function App() {
  return (
    <ToastProvider>
      <SesionProvider>
        <ResenasProvider>
          <CarritoProvider>
            <Rutas />
          </CarritoProvider>
        </ResenasProvider>
      </SesionProvider>
    </ToastProvider>
  )
}

export default App
