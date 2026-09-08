// Catálogo de productos (fuente única de datos para el listado, el destacado y el detalle)
const PRODUCTOS = [
    { id: 1, nombre: "PlayStation 5", categoria: "Consolas", precio: 549990, stock: 8,
      imagen: "images/ps5.jpg", descripcion: "Gráficos de última generación y tiempos de carga ultrarrápidos." },
    { id: 2, nombre: "PC Gamer ASUS ROG Strix", categoria: "Computadores Gamers", precio: 1299990, stock: 4,
      imagen: "images/pc.jpg", descripcion: "Rendimiento excepcional para los juegos más exigentes." },
    { id: 3, nombre: "Silla Gamer Secretlab Titan", categoria: "Sillas Gamers", precio: 349990, stock: 6,
      imagen: "images/silla gamer.jpg", descripcion: "Soporte ergonómico y ajustable para sesiones largas de juego." },
    { id: 4, nombre: "Control Xbox Series X", categoria: "Accesorios", precio: 59990, stock: 15,
      imagen: "images/control xbox.jpg", descripcion: "Botones mapeables y respuesta táctil mejorada." },
    { id: 5, nombre: "Mouse Logitech G502 HERO", categoria: "Mouse", precio: 49990, stock: 20,
      imagen: "images/mouse.jpg", descripcion: "Sensor de alta precisión y botones personalizables." },
    { id: 6, nombre: "Polera Personalizada Level-Up", categoria: "Poleras Personalizadas", precio: 14990, stock: 30,
      imagen: "images/Gemini_Generated_Image_9b7wpu9b7wpu9b7w.png", descripcion: "Cómoda y estilizada, personalízala con tu gamer tag." }
];

//Carrito de compras (persistido en localStorage para que sobreviva entre páginas y recargas)

const CARRITO_STORAGE_KEY = 'levelup_carrito';

function leerCarrito() {
    try {
        const datos = window.localStorage.getItem(CARRITO_STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(carrito) {
    try {
        window.localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch (error) {
        // localStorage no disponible (modo privado, cuota llena, etc.): el carrito no persistirá.
    }
}

function totalUnidadesCarrito(carrito) {
    return carrito.reduce(function (total, item) { return total + item.cantidad; }, 0);
}

function formatearPrecio(numero) {
    return '$' + numero.toLocaleString('es-CL') + ' CLP';
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = totalUnidadesCarrito(leerCarrito());
    }
}

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add('show');
    window.clearTimeout(mostrarToast._t);
    mostrarToast._t = window.setTimeout(function () {
        toast.classList.remove('show');
    }, 2200);
}

// Añade "cantidad" unidades del producto "idProducto" al carrito y persiste el cambio.
function agregarAlCarrito(idProducto, cantidad) {
    const producto = PRODUCTOS.find(function (p) { return p.id === idProducto; });
    if (!producto) return;

    const carrito = leerCarrito();
    const item = carrito.find(function (i) { return i.id === idProducto; });
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({ id: idProducto, cantidad: cantidad });
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
    mostrarToast(producto.nombre + ' añadido al carrito');
}

// Construye el markup de una tarjeta de producto para el catálogo/relacionados.
function crearTarjetaProducto(producto) {
    const articulo = document.createElement('article');
    articulo.className = 'producto-card';
    articulo.innerHTML =
        '<img src="' + producto.imagen + '" width="400" height="300" alt="' + producto.nombre + '" loading="lazy">' +
        '<span class="categoria">' + producto.categoria + '</span>' +
        '<h3>' + producto.nombre + '</h3>' +
        '<p>' + producto.descripcion + '</p>' +
        '<p class="precio">' + formatearPrecio(producto.precio) + '</p>' +
        '<a href="detalleProducto.html?id=' + producto.id + '" class="btn btn-outline-accent">Ver detalle</a>' +
        '<button type="button" class="btn btn-accent-green btn-agregar-carrito" data-id="' + producto.id + '">Añadir al carrito</button>';
    return articulo;
}

document.addEventListener('DOMContentLoaded', function () {

    //Utilidades

    // Solo permite correos @duoc.cl, @profesor.duoc.cl y @gmail.com (regla de negocio del caso)
    function esCorreoPermitido(valor) {
        const patron = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
        return patron.test(valor.trim());
    }

    // Formato básico de correo (para el newsletter, sin restricción de dominio)
    function esCorreoValido(valor) {
        const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return patron.test(valor.trim());
    }

    function mostrarError(input, mensaje) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        const feedback = document.getElementById('error-' + input.id);
        if (feedback) {
            feedback.textContent = mensaje;
            feedback.classList.add('show');
        }
    }

    function limpiarError(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const feedback = document.getElementById('error-' + input.id);
        if (feedback) {
            feedback.textContent = '';
            feedback.classList.remove('show');
        }
    }

    //Contador del carrito en el header (se sincroniza en cada página al cargar)

    actualizarContadorCarrito();

    //Botones "Añadir al carrito" (delegación de eventos: funciona en botones ya
    //presentes en el HTML -index, relacionados- y en los generados por JS -productos.html-)

    document.body.addEventListener('click', function (evento) {
        const boton = evento.target.closest('.btn-agregar-carrito');
        if (!boton) return;
        const idProducto = Number(boton.dataset.id);
        if (!idProducto) return;
        agregarAlCarrito(idProducto, 1);
    });

    //Página de catálogo completo (productos.html)

    const listadoProductos = document.getElementById('productos-listado');
    if (listadoProductos) {
        listadoProductos.innerHTML = '';
        PRODUCTOS.forEach(function (producto) {
            listadoProductos.appendChild(crearTarjetaProducto(producto));
        });
    }

    //Página de detalle de producto (detalleProducto.html)

    const contenedorDetalle = document.getElementById('detalle-contenido');
    if (contenedorDetalle) {
        const params = new URLSearchParams(window.location.search);
        const idProducto = Number(params.get('id'));
        const producto = PRODUCTOS.find(function (p) { return p.id === idProducto; });
        const noEncontrado = document.getElementById('detalle-no-encontrado');

        if (producto) {
            document.getElementById('detalle-title').textContent = producto.nombre + ' | Level-Up Gamer';
            document.getElementById('detalle-breadcrumb-nombre').textContent = producto.nombre;
            document.getElementById('detalle-imagen').src = producto.imagen;
            document.getElementById('detalle-imagen').alt = producto.nombre;
            document.getElementById('detalle-categoria').textContent = producto.categoria;
            document.getElementById('detalle-nombre').textContent = producto.nombre;
            document.getElementById('detalle-precio').textContent = formatearPrecio(producto.precio);
            document.getElementById('detalle-descripcion').textContent = producto.descripcion;
            document.getElementById('detalle-stock').textContent = producto.stock > 0
                ? 'Stock disponible: ' + producto.stock
                : 'Sin stock';

            contenedorDetalle.style.display = '';

            const botonDetalleAgregar = document.getElementById('detalle-btn-agregar');
            if (botonDetalleAgregar) {
                botonDetalleAgregar.addEventListener('click', function () {
                    const cantidad = Number(document.getElementById('detalle-cantidad').value) || 1;
                    agregarAlCarrito(producto.id, cantidad);
                });
            }

            // Productos relacionados: misma categoría, excluyendo el actual
            const relacionadosWrap = document.getElementById('detalle-relacionados');
            if (relacionadosWrap) {
                const relacionados = PRODUCTOS.filter(function (p) {
                    return p.categoria === producto.categoria && p.id !== producto.id;
                });
                relacionados.forEach(function (p) {
                    relacionadosWrap.appendChild(crearTarjetaProducto(p));
                });
            }
        } else if (noEncontrado) {
            noEncontrado.style.display = '';
        }
    }

    //Página de carrito (carrito.html)

    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const tablaCarritoBody = document.getElementById('tabla-carrito-body');
    const carritoTotalEl = document.getElementById('carrito-total');
    const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
    const btnPagar = document.getElementById('btn-pagar');

    if (carritoVacio && carritoContenido && tablaCarritoBody) {

        function renderizarCarrito() {
            const carrito = leerCarrito();

            if (carrito.length === 0) {
                carritoVacio.style.display = '';
                carritoContenido.style.display = 'none';
                actualizarContadorCarrito();
                return;
            }

            carritoVacio.style.display = 'none';
            carritoContenido.style.display = '';
            tablaCarritoBody.innerHTML = '';

            let total = 0;

            carrito.forEach(function (item) {
                const producto = PRODUCTOS.find(function (p) { return p.id === item.id; });
                if (!producto) return;

                const subtotal = producto.precio * item.cantidad;
                total += subtotal;

                const fila = document.createElement('tr');
                fila.innerHTML =
                    '<td>' +
                        '<div class="carrito-producto">' +
                            '<img class="carrito-img" src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
                            '<span>' + producto.nombre + '</span>' +
                        '</div>' +
                    '</td>' +
                    '<td>' + formatearPrecio(producto.precio) + '</td>' +
                    '<td>' +
                        '<input type="number" class="input-cantidad" min="1" max="' + producto.stock + '" value="' + item.cantidad + '" data-id="' + producto.id + '" aria-label="Cantidad de ' + producto.nombre + '">' +
                    '</td>' +
                    '<td class="carrito-subtotal">' + formatearPrecio(subtotal) + '</td>' +
                    '<td><button type="button" class="btn-eliminar" data-id="' + producto.id + '" aria-label="Eliminar ' + producto.nombre + ' del carrito">✕</button></td>';
                tablaCarritoBody.appendChild(fila);
            });

            carritoTotalEl.textContent = formatearPrecio(total);
            actualizarContadorCarrito();
        }

        tablaCarritoBody.addEventListener('change', function (evento) {
            const input = evento.target.closest('.input-cantidad');
            if (!input) return;

            const id = Number(input.dataset.id);
            const maximo = Number(input.max) || 99;
            let cantidad = Math.floor(Number(input.value));
            if (!cantidad || cantidad < 1) cantidad = 1;
            if (cantidad > maximo) cantidad = maximo;

            const carrito = leerCarrito();
            const item = carrito.find(function (i) { return i.id === id; });
            if (item) {
                item.cantidad = cantidad;
                guardarCarrito(carrito);
            }
            renderizarCarrito();
        });

        tablaCarritoBody.addEventListener('click', function (evento) {
            const boton = evento.target.closest('.btn-eliminar');
            if (!boton) return;
            const id = Number(boton.dataset.id);
            const carrito = leerCarrito().filter(function (i) { return i.id !== id; });
            guardarCarrito(carrito);
            renderizarCarrito();
            mostrarToast('Producto eliminado del carrito');
        });

        if (btnVaciarCarrito) {
            btnVaciarCarrito.addEventListener('click', function () {
                guardarCarrito([]);
                renderizarCarrito();
                mostrarToast('Carrito vaciado');
            });
        }

        if (btnPagar) {
            btnPagar.addEventListener('click', function () {
                if (leerCarrito().length === 0) return;
                guardarCarrito([]);
                renderizarCarrito();
                mostrarToast('¡Gracias por tu compra!');
            });
        }

        renderizarCarrito();
    }

    //Formulario de newsletter (index y footer)

    const formNewsletter = document.getElementById('formNewsletter');
    if (formNewsletter) {
        formNewsletter.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const input = formNewsletter.querySelector('input[type="email"]');
            const feedback = formNewsletter.querySelector('.form-feedback');

            if (!input.value.trim() || !esCorreoValido(input.value)) {
                feedback.textContent = 'Ingresa un correo electrónico válido.';
                feedback.classList.add('error');
                input.classList.add('is-invalid');
                return;
            }

            input.classList.remove('is-invalid');
            feedback.classList.remove('error');
            feedback.textContent = '¡Listo! Te avisaremos de nuestras novedades.';
            formNewsletter.reset();
        });
    }

    //Formulario de contacto

    const formContacto = document.getElementById('formContacto');
    if (formContacto) {
        const nombre = document.getElementById('nombre');
        const correo = document.getElementById('correo');
        const mensaje = document.getElementById('mensaje');
        const terminos = document.getElementById('terminos');
        const contadorMensaje = document.getElementById('contador-mensaje');
        const exito = document.getElementById('contacto-success');

        function validarNombre() {
            const valor = nombre.value.trim();
            if (!valor) {
                mostrarError(nombre, 'El nombre completo es obligatorio.');
                return false;
            }
            if (valor.length > 100) {
                mostrarError(nombre, 'El nombre no puede superar los 100 caracteres.');
                return false;
            }
            limpiarError(nombre);
            return true;
        }

        function validarCorreo() {
            const valor = correo.value.trim();
            if (!valor) {
                correo.classList.remove('is-invalid', 'is-valid');
                const feedback = document.getElementById('error-correo');
                if (feedback) { feedback.textContent = ''; feedback.classList.remove('show'); }
                return true;
            }
            if (valor.length > 100) {
                mostrarError(correo, 'El correo no puede superar los 100 caracteres.');
                return false;
            }
            if (!esCorreoPermitido(valor)) {
                mostrarError(correo, 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                return false;
            }
            limpiarError(correo);
            return true;
        }

        function validarMensaje() {
            const valor = mensaje.value.trim();
            if (!valor) {
                mostrarError(mensaje, 'Cuéntanos en qué te podemos ayudar.');
                return false;
            }
            if (valor.length > 500) {
                mostrarError(mensaje, 'El mensaje no puede superar los 500 caracteres.');
                return false;
            }
            limpiarError(mensaje);
            return true;
        }

        function validarTerminos() {
            const feedback = document.getElementById('error-terminos');
            if (!terminos.checked) {
                if (feedback) { feedback.textContent = 'Debes aceptar para que podamos contactarte.'; feedback.classList.add('show'); }
                return false;
            }
            if (feedback) { feedback.textContent = ''; feedback.classList.remove('show'); }
            return true;
        }

        mensaje.addEventListener('input', function () {
            const restantes = mensaje.value.length;
            if (contadorMensaje) contadorMensaje.textContent = restantes + '/500';
        });

        nombre.addEventListener('blur', validarNombre);
        correo.addEventListener('blur', validarCorreo);
        mensaje.addEventListener('blur', validarMensaje);
        terminos.addEventListener('change', validarTerminos);

        formContacto.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const nombreOk = validarNombre();
            const correoOk = validarCorreo();
            const mensajeOk = validarMensaje();
            const terminosOk = validarTerminos();

            if (!nombreOk || !correoOk || !mensajeOk || !terminosOk) {
                const primerError = formContacto.querySelector('.is-invalid, .form-check-input:invalid');
                if (primerError) primerError.focus();
                if (exito) exito.textContent = '';
                return;
            }

            if (exito) {
                exito.textContent = '¡Gracias por tu mensaje! Te responderemos a la brevedad.';
            }
            formContacto.reset();
            [nombre, correo, mensaje].forEach(function (campo) {
                campo.classList.remove('is-valid', 'is-invalid');
            });
            if (contadorMensaje) contadorMensaje.textContent = '0/500';
        });
    }

});