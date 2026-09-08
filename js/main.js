/* ============================================================
   Level-Up Gamer - main.js
   Lógica del carrito (localStorage) + newsletter + contacto
   ============================================================ */

/* ---------- Módulo de Carrito ----------
   Se guarda en localStorage bajo la clave "levelup_carrito" como
   un array de objetos: { id, nombre, precio, imagen, cantidad }
   Al usar localStorage, el carrito persiste al recargar la página
   y se comparte entre index.html, carrito.html, contacto.html, etc.
-------------------------------------------------- */
const Carrito = (function () {
    const CLAVE = 'levelup_carrito';

    function obtener() {
        try {
            const datos = localStorage.getItem(CLAVE);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('No se pudo leer el carrito guardado:', error);
            return [];
        }
    }

    function guardar(items) {
        localStorage.setItem(CLAVE, JSON.stringify(items));
        // Avisamos al resto de la página (ej. contador del header) que el carrito cambió
        document.dispatchEvent(new CustomEvent('carrito:actualizado', { detail: items }));
    }

    function agregar(producto) {
        const items = obtener();
        const existente = items.find(function (item) { return item.id === producto.id; });

        if (existente) {
            existente.cantidad += 1;
        } else {
            items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }
        guardar(items);
        return items;
    }

    function actualizarCantidad(id, cantidad) {
        let items = obtener();
        cantidad = parseInt(cantidad, 10);

        if (!cantidad || cantidad < 1) {
            items = items.filter(function (item) { return item.id !== id; });
        } else {
            items = items.map(function (item) {
                if (item.id === id) item.cantidad = cantidad;
                return item;
            });
        }
        guardar(items);
        return items;
    }

    function eliminar(id) {
        const items = obtener().filter(function (item) { return item.id !== id; });
        guardar(items);
        return items;
    }

    function vaciar() {
        guardar([]);
    }

    function totalUnidades() {
        return obtener().reduce(function (acum, item) { return acum + item.cantidad; }, 0);
    }

    function totalPrecio() {
        return obtener().reduce(function (acum, item) { return acum + (item.precio * item.cantidad); }, 0);
    }

    return {
        obtener: obtener,
        agregar: agregar,
        actualizarCantidad: actualizarCantidad,
        eliminar: eliminar,
        vaciar: vaciar,
        totalUnidades: totalUnidades,
        totalPrecio: totalPrecio
    };
})();

/* Formatea un número como precio en pesos chilenos: 549990 -> "$549.990 CLP" */
function formatearCLP(numero) {
    return '$' + numero.toLocaleString('es-CL') + ' CLP';
}

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Utilidades ---------- */

    function esCorreoPermitido(valor) {
        const patron = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
        return patron.test(valor.trim());
    }

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

    /* ---------- Contador del carrito (header, en todas las páginas) ---------- */

    function actualizarContador() {
        const contador = document.getElementById('cart-count');
        if (contador) {
            contador.textContent = Carrito.totalUnidades();
        }
    }

    actualizarContador();
    document.addEventListener('carrito:actualizado', actualizarContador);

    /* ---------- Botones "Añadir al carrito" (index, productos, etc.) ---------- */

    const botonesCarrito = document.querySelectorAll('.btn-agregar-carrito');
    botonesCarrito.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const producto = {
                id: boton.dataset.id || boton.dataset.nombre,
                nombre: boton.dataset.nombre || 'Producto',
                precio: parseInt(boton.dataset.precio, 10) || 0,
                imagen: boton.dataset.imagen || ''
            };
            Carrito.agregar(producto);
            mostrarToast(producto.nombre + ' añadido al carrito');
        });
    });

    /* ---------- Página carrito.html ---------- */

    const tablaCarrito = document.getElementById('tabla-carrito-body');
    if (tablaCarrito) {

        function renderizarCarrito() {
            const items = Carrito.obtener();
            const carritoVacio = document.getElementById('carrito-vacio');
            const carritoContenido = document.getElementById('carrito-contenido');

            if (items.length === 0) {
                if (carritoVacio) carritoVacio.style.display = 'block';
                if (carritoContenido) carritoContenido.style.display = 'none';
                return;
            }

            if (carritoVacio) carritoVacio.style.display = 'none';
            if (carritoContenido) carritoContenido.style.display = 'block';

            tablaCarrito.innerHTML = '';

            items.forEach(function (item) {
                const fila = document.createElement('tr');
                fila.innerHTML =
                    '<td class="carrito-producto">' +
                        '<img src="' + item.imagen + '" alt="' + item.nombre + '" class="carrito-img">' +
                        '<span>' + item.nombre + '</span>' +
                    '</td>' +
                    '<td>' + formatearCLP(item.precio) + '</td>' +
                    '<td>' +
                        '<input type="number" class="form-control input-cantidad" min="1" max="99" value="' + item.cantidad + '" data-id="' + item.id + '" aria-label="Cantidad de ' + item.nombre + '">' +
                    '</td>' +
                    '<td class="carrito-subtotal">' + formatearCLP(item.precio * item.cantidad) + '</td>' +
                    '<td>' +
                        '<button type="button" class="btn-eliminar" data-id="' + item.id + '" aria-label="Eliminar ' + item.nombre + '">✕</button>' +
                    '</td>';
                tablaCarrito.appendChild(fila);
            });

            const totalEl = document.getElementById('carrito-total');
            if (totalEl) totalEl.textContent = formatearCLP(Carrito.totalPrecio());
        }

        // Cambiar cantidad
        tablaCarrito.addEventListener('change', function (evento) {
            if (evento.target.classList.contains('input-cantidad')) {
                Carrito.actualizarCantidad(evento.target.dataset.id, evento.target.value);
                renderizarCarrito();
            }
        });

        // Eliminar producto
        tablaCarrito.addEventListener('click', function (evento) {
            const boton = evento.target.closest('.btn-eliminar');
            if (boton) {
                Carrito.eliminar(boton.dataset.id);
                renderizarCarrito();
                mostrarToast('Producto eliminado del carrito');
            }
        });

        // Vaciar carrito
        const botonVaciar = document.getElementById('btn-vaciar-carrito');
        if (botonVaciar) {
            botonVaciar.addEventListener('click', function () {
                Carrito.vaciar();
                renderizarCarrito();
                mostrarToast('Carrito vaciado');
            });
        }

        // Botón de pago (demostrativo, sin backend)
        const botonPagar = document.getElementById('btn-pagar');
        if (botonPagar) {
            botonPagar.addEventListener('click', function (evento) {
                evento.preventDefault();
                if (Carrito.obtener().length === 0) return;
                Carrito.vaciar();
                renderizarCarrito();
                mostrarToast('¡Gracias por tu compra! Te contactaremos para coordinar el despacho.');
            });
        }

        renderizarCarrito();
    }

    /* ---------- Formulario de newsletter (index y footer) ---------- */

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

    /* ---------- Formulario de contacto ---------- */

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
