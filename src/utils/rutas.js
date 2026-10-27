// Traduce el nombre de una página (el que usa el resto de la app) a su URL de React Router.
//   rutaDe('detalle', { id: 3 })              -> '/productos/3'
//   rutaDe('productos', { categoria: 'Mouse' }) -> '/productos?categoria=Mouse'
const RUTAS = {
  inicio: () => '/',
  productos: (p) => (p.categoria ? `/productos?categoria=${encodeURIComponent(p.categoria)}` : '/productos'),
  detalle: (p) => `/productos/${p.id}`,
  carrito: () => '/carrito',
  login: () => '/login',
  registro: () => '/registro',
  perfil: () => '/perfil',
  nosotros: () => '/nosotros',
  blog: () => '/blog',
  contacto: () => '/contacto',
}

export function rutaDe(pagina, params = {}) {
  const construir = RUTAS[pagina]
  return construir ? construir(params) : '/'
}
