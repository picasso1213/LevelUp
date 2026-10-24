// Catálogo de productos: fuente única de datos para el listado, el destacado y el detalle.
// Para agregar un producto basta con sumar un objeto aquí: ningún componente cambia.
export const PRODUCTOS = [
  { id: 1, nombre: 'PlayStation 5', categoria: 'Consolas', precio: 549990, stock: 8,
    imagen: '/images/ps5.jpg', descripcion: 'Gráficos de última generación y tiempos de carga ultrarrápidos.' },
  { id: 2, nombre: 'PC Gamer ASUS ROG Strix', categoria: 'Computadores Gamers', precio: 1299990, stock: 4,
    imagen: '/images/pc.jpg', descripcion: 'Rendimiento excepcional para los juegos más exigentes.' },
  { id: 3, nombre: 'Silla Gamer Secretlab Titan', categoria: 'Sillas Gamers', precio: 349990, stock: 6,
    imagen: '/images/silla-gamer.jpg', descripcion: 'Soporte ergonómico y ajustable para sesiones largas de juego.' },
  { id: 4, nombre: 'Control Xbox Series X', categoria: 'Accesorios', precio: 59990, stock: 15,
    imagen: '/images/control-xbox.jpg', descripcion: 'Botones mapeables y respuesta táctil mejorada.' },
  { id: 5, nombre: 'Mouse Logitech G502 HERO', categoria: 'Mouse', precio: 49990, stock: 20,
    imagen: '/images/mouse.jpg', descripcion: 'Sensor de alta precisión y botones personalizables.' },
  { id: 6, nombre: 'Polera Personalizada Level-Up', categoria: 'Poleras Personalizadas', precio: 14990, stock: 30,
    imagen: '/images/polera.png', descripcion: 'Cómoda y estilizada, personalízala con tu gamer tag.' },
]
