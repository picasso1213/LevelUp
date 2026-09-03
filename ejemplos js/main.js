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

    //Carrito (botones Añadir al carrito)

    let totalCarrito = 0;
    const botonesCarrito = document.querySelectorAll('.btn-agregar-carrito');
    const contadorCarrito = document.getElementById('cart-count');

    botonesCarrito.forEach(function (boton) {
        boton.addEventListener('click', function () {
            totalCarrito += 1;
            if (contadorCarrito) {
                contadorCarrito.textContent = totalCarrito;
            }
            const nombre = boton.dataset.nombre || 'Producto';
            mostrarToast(nombre + ' añadido al carrito');
        });
    });

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

        // El correo es opcional. si se ingresa, debe cumplir el dominio y el largo.
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

        // Sugerencia dinámica: contador de caracteres del mensaje
        mensaje.addEventListener('input', function () {
            const restantes = mensaje.value.length;
            if (contadorMensaje) contadorMensaje.textContent = restantes + '/500';
        });

        // Validación en tiempo real
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
