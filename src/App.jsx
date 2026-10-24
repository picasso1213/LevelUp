import { ToastProvider } from './context/ToastContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { SesionProvider } from './context/SesionContext.jsx'
import { ResenasProvider } from './context/ResenasContext.jsx'
import { NavegacionProvider, useNavegacion } from './context/NavegacionContext.jsx'
import Layout from './components/templates/Layout.jsx'
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

// Tabla de páginas: nombre -> componente. (Con React Router esto pasa a ser <Routes>.)
const PAGINAS = {
  inicio: Inicio,
  productos: Productos,
  detalle: DetalleProducto,
  carrito: Carrito,
  login: Login,
  registro: Registro,
  perfil: Perfil,
  nosotros: Nosotros,
  blog: Blog,
  contacto: Contacto,
}

function PaginaActual() {
  const { pagina } = useNavegacion()
  const Pagina = PAGINAS[pagina] || Inicio
  return <Pagina />
}

// App = proveedores de estado global + la página que corresponde
function App() {
  return (
    <ToastProvider>
      <SesionProvider>
        <ResenasProvider>
          <CarritoProvider>
            <NavegacionProvider>
              <Layout>
                <PaginaActual />
              </Layout>
            </NavegacionProvider>
          </CarritoProvider>
        </ResenasProvider>
      </SesionProvider>
    </ToastProvider>
  )
}

export default App
