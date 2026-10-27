import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import FiltrosProductos from '../components/molecules/FiltrosProductos.jsx'
import CatalogoProductos from '../components/organisms/CatalogoProductos.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useResenas } from '../context/ResenasContext.jsx'
import { useStorage } from '../hooks/useStorage.js'
import { FILTROS_INICIALES, categoriasDe, filtrarProductos } from '../utils/productos.js'

function Productos() {
  const { productos, agregar } = useCarrito()
  const { resenas } = useResenas()
  // Los filtros se recuerdan en sessionStorage (mientras la pestaña siga abierta)
  const [filtros, setFiltros] = useStorage('levelup_filtros', FILTROS_INICIALES, 'session')
  const { search } = useLocation() // useLocation: lee ?categoria=Mouse de la URL
  const categoriaUrl = new URLSearchParams(search).get('categoria')

  // Si se llegó con una categoría (desde la portada), se aplica como filtro
  useEffect(() => {
    if (categoriaUrl) setFiltros((f) => ({ ...f, categoria: categoriaUrl }))
  }, [categoriaUrl, setFiltros])

  // Dato derivado: la lista filtrada se calcula, no se guarda en otro estado
  const visibles = useMemo(() => filtrarProductos(productos, filtros), [productos, filtros])

  return (
    <section className="panel">
      <Container>
        <h1>Productos</h1>
        <p className="text-secondary">Todo nuestro catálogo, en un solo lugar.</p>

        <FiltrosProductos
          filtros={filtros}
          categorias={categoriasDe(productos)}
          onCambiar={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_INICIALES)}
        />

        <p className="text-secondary mt-3" role="status">
          {visibles.length === productos.length
            ? `${visibles.length} producto(s) en el catálogo`
            : `Mostrando ${visibles.length} de ${productos.length} productos`}
        </p>

        <CatalogoProductos productos={visibles} resenas={resenas} onAgregar={agregar} />
      </Container>
    </section>
  )
}

export default Productos
