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

    const promedio = calcularPromedioResenas(producto.id);
    const cantidadResenas = obtenerResenasProducto(producto.id).length;
    const lineaResenas = promedio !== null
        ? '<div class="resenas-mini">' + renderEstrellas(promedio) + ' <span class="text-secondary">(' + cantidadResenas + ')</span></div>'
        : '<div class="resenas-mini text-secondary">Sin reseñas aún</div>';

    articulo.innerHTML =
        '<img src="' + producto.imagen + '" width="400" height="300" alt="' + producto.nombre + '" loading="lazy">' +
        '<span class="categoria">' + producto.categoria + '</span>' +
        '<h3>' + producto.nombre + '</h3>' +
        lineaResenas +
        '<p>' + producto.descripcion + '</p>' +
        '<p class="precio">' + formatearPrecio(producto.precio) + '</p>' +
        '<a href="detalleProducto.html?id=' + producto.id + '" class="btn btn-outline-accent">Ver detalle</a>' +
        '<button type="button" class="btn btn-accent-green btn-agregar-carrito" data-id="' + producto.id + '">Añadir al carrito</button>';
    return articulo;
}

//Datos de regiones y comunas de Chile (para el selector en cascada del registro)

const REGIONES = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"],
    "Antofagasta": ["Antofagasta", "Calama", "Tocopilla", "Mejillones"],
    "Atacama": ["Copiapó", "Vallenar", "Chañaral", "Diego de Almagro"],
    "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel"],
    "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio", "Los Andes"],
    "Metropolitana de Santiago": ["Santiago", "Puente Alto", "Maipú", "Las Condes", "Providencia", "La Florida", "Ñuñoa"],
    "Libertador General Bernardo O'Higgins": ["Rancagua", "San Fernando", "Rengo", "Santa Cruz"],
    "Maule": ["Talca", "Curicó", "Linares", "Constitución"],
    "Ñuble": ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes"],
    "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Chiguayante"],
    "La Araucanía": ["Temuco", "Villarrica", "Angol", "Pucón"],
    "Los Ríos": ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"],
    "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Puerto Varas"],
    "Aysén": ["Coyhaique", "Puerto Aysén", "Chile Chico"],
    "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Puerto Natales", "Porvenir"]
};

//Usuarios y sesión (persistidos en localStorage)

const USUARIOS_STORAGE_KEY = 'levelup_usuarios';
const SESION_STORAGE_KEY = 'levelup_sesion';

function leerUsuarios() {
    try {
        const datos = window.localStorage.getItem(USUARIOS_STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    try {
        window.localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
    } catch (error) {
        // localStorage no disponible
    }
}

function leerSesion() {
    try {
        const datos = window.localStorage.getItem(SESION_STORAGE_KEY);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        return null;
    }
}

function guardarSesion(correo) {
    try {
        window.localStorage.setItem(SESION_STORAGE_KEY, JSON.stringify({ correo: correo }));
    } catch (error) {
        // localStorage no disponible
    }
}

function cerrarSesion() {
    try {
        window.localStorage.removeItem(SESION_STORAGE_KEY);
    } catch (error) {
        // localStorage no disponible
    }
    window.location.href = 'index.html';
}

function obtenerUsuarioActual() {
    const sesion = leerSesion();
    if (!sesion) return null;
    return leerUsuarios().find(function (u) { return u.correo === sesion.correo; }) || null;
}

// Calcula la edad en años a partir de "YYYY-MM-DD"
function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
    if (isNaN(nacimiento.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

// Correo institucional Duoc => 20% de descuento de por vida
function esCorreoDuoc(correo) {
    return /@(duoc\.cl|profesor\.duoc\.cl)$/i.test(correo.trim());
}

// Muestra en el header "Mi perfil" / "Cerrar sesión" en vez de "Iniciar sesión" cuando hay sesión activa
function actualizarNavSesion() {
    const sesion = leerSesion();
    const enlacesLogin = document.querySelectorAll('a[href="login.html"]');

    enlacesLogin.forEach(function (enlace) {
        if (sesion) {
            enlace.textContent = 'Mi perfil';
            enlace.setAttribute('href', 'perfil.html');

            if (!enlace.parentElement.querySelector('.nav-link-logout')) {
                const liLogout = document.createElement('li');
                liLogout.className = 'nav-item';
                liLogout.innerHTML = '<a class="nav-link nav-link-logout" href="#" role="button">Cerrar sesión</a>';
                enlace.parentElement.insertAdjacentElement('afterend', liLogout);
                liLogout.querySelector('a').addEventListener('click', function (evento) {
                    evento.preventDefault();
                    cerrarSesion();
                });
            }
        }
    });
}

//Programa de referidos y gamificación

const PUNTOS_POR_REFERIDO = 50;      // gana quien invita, por cada persona que se registra con su código
const PUNTOS_BONUS_REFERIDO_NUEVO = 20; // gana el usuario nuevo si entró con un código válido
const PUNTOS_POR_CADA_1000_CLP = 1;  // puntos ganados al comprar

const NIVELES_LEVELUP = [
    { nombre: 'Bronce',   puntosMin: 0 },
    { nombre: 'Plata',    puntosMin: 100 },
    { nombre: 'Oro',      puntosMin: 300 },
    { nombre: 'Platino',  puntosMin: 700 },
    { nombre: 'Diamante', puntosMin: 1500 }
];

const CANJES_LEVELUP = [
    { id: 'cupon5', nombre: 'Cupón 5% de descuento', costo: 100, tipo: 'descuento', valor: 5 },
    { id: 'cupon10', nombre: 'Cupón 10% de descuento', costo: 250, tipo: 'descuento', valor: 10 },
    { id: 'mouse', nombre: 'Mouse Logitech G502 HERO gratis', costo: 400, tipo: 'producto', valor: 'Mouse Logitech G502 HERO' },
    { id: 'polera', nombre: 'Polera Personalizada Level-Up gratis', costo: 600, tipo: 'producto', valor: 'Polera Personalizada Level-Up' }
];

// Código de referido único a partir del nombre + apellidos + sufijo aleatorio
function generarCodigoReferido(nombre, apellidos) {
    const iniciales = ((nombre[0] || '') + (apellidos[0] || '')).toUpperCase();
    const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase();
    return iniciales + sufijo;
}

// Determina el nivel actual y el progreso hacia el siguiente, según los puntos acumulados
function obtenerNivelActual(puntos) {
    let actual = NIVELES_LEVELUP[0];
    let siguiente = null;

    for (let i = 0; i < NIVELES_LEVELUP.length; i++) {
        if (puntos >= NIVELES_LEVELUP[i].puntosMin) {
            actual = NIVELES_LEVELUP[i];
            siguiente = NIVELES_LEVELUP[i + 1] || null;
        }
    }

    const progreso = siguiente
        ? Math.min(100, Math.round(((puntos - actual.puntosMin) / (siguiente.puntosMin - actual.puntosMin)) * 100))
        : 100;

    return { actual: actual, siguiente: siguiente, progreso: progreso };
}

//Reseñas y calificaciones de productos

const RESENAS_STORAGE_KEY = 'levelup_resenas';

function leerResenas() {
    try {
        const datos = window.localStorage.getItem(RESENAS_STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        return [];
    }
}

function guardarResenas(resenas) {
    try {
        window.localStorage.setItem(RESENAS_STORAGE_KEY, JSON.stringify(resenas));
    } catch (error) {
        // localStorage no disponible
    }
}

function obtenerResenasProducto(idProducto) {
    return leerResenas().filter(function (r) { return r.productoId === idProducto; });
}

function calcularPromedioResenas(idProducto) {
    const resenas = obtenerResenasProducto(idProducto);
    if (resenas.length === 0) return null;
    const suma = resenas.reduce(function (acum, r) { return acum + r.calificacion; }, 0);
    return suma / resenas.length;
}

// Genera el markup de estrellas (llenas/vacías) para un promedio dado
function renderEstrellas(promedio) {
    const redondeado = Math.round(promedio || 0);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += '<span class="estrella' + (i <= redondeado ? ' llena' : '') + '">★</span>';
    }
    return html;
}

// Verifica si el usuario tiene, en su historial de compras, al menos una unidad del producto
function usuarioComproProducto(usuario, idProducto) {
    if (!usuario || !usuario.historialCompras) return false;
    return usuario.historialCompras.some(function (pedido) {
        return pedido.productos.some(function (p) { return p.id === idProducto; });
    });
}

document.addEventListener('DOMContentLoaded', function () {

        //Sesión activa (header) y RUN

    actualizarNavSesion();

    // Valida un RUN chileno con dígito verificador (acepta con o sin K final)
    function esRunValido(valor) {
        const limpio = valor.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
        if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) return false;

        const cuerpo = limpio.slice(0, -1);
        const dv = limpio.slice(-1);
        let suma = 0;
        let multiplo = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += Number(cuerpo[i]) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }

        const resto = 11 - (suma % 11);
        const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
        return dv === dvEsperado;
    }

    //Selector de Región / Comuna en cascada (registro.html)

    const selectRegion = document.getElementById('reg-region');
    const selectComuna = document.getElementById('reg-comuna');

    if (selectRegion && selectComuna) {
        Object.keys(REGIONES).forEach(function (nombreRegion) {
            const opcion = document.createElement('option');
            opcion.value = nombreRegion;
            opcion.textContent = nombreRegion;
            selectRegion.appendChild(opcion);
        });

        selectRegion.addEventListener('change', function () {
            selectComuna.innerHTML = '';
            const comunas = REGIONES[selectRegion.value] || [];

            if (comunas.length === 0) {
                selectComuna.disabled = true;
                const opcionVacia = document.createElement('option');
                opcionVacia.value = '';
                opcionVacia.textContent = '-- Primero selecciona la región --';
                opcionVacia.selected = true;
                opcionVacia.disabled = true;
                selectComuna.appendChild(opcionVacia);
                return;
            }

            selectComuna.disabled = false;
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '-- Selecciona la comuna --';
            placeholder.selected = true;
            placeholder.disabled = true;
            selectComuna.appendChild(placeholder);

            comunas.forEach(function (comuna) {
                const opcion = document.createElement('option');
                opcion.value = comuna;
                opcion.textContent = comuna;
                selectComuna.appendChild(opcion);
            });
        });
    }

    //Formulario de registro (registro.html)

    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        const regNombre = document.getElementById('reg-nombre');
        const regApellidos = document.getElementById('reg-apellidos');
        const regRun = document.getElementById('reg-run');
        const regCorreo = document.getElementById('reg-correo');
        const regFecha = document.getElementById('reg-fecha-nacimiento');
        const regPassword = document.getElementById('reg-password');
        const regPassword2 = document.getElementById('reg-password2');
        const regRegion = document.getElementById('reg-region');
        const regComuna = document.getElementById('reg-comuna');
        const regDireccion = document.getElementById('reg-direccion');
        const regTelefono = document.getElementById('reg-telefono');
        const registroError = document.getElementById('registro-error');
        const registroSuccess = document.getElementById('registro-success');
        const regCodigoReferido = document.getElementById('reg-codigo-referido');

        formRegistro.addEventListener('submit', function (evento) {
            evento.preventDefault();
            registroError.textContent = '';
            registroError.classList.remove('show');
            let valido = true;

            if (!regNombre.value.trim()) { mostrarError(regNombre, 'El nombre es obligatorio.'); valido = false; } else limpiarError(regNombre);
            if (!regApellidos.value.trim()) { mostrarError(regApellidos, 'Los apellidos son obligatorios.'); valido = false; } else limpiarError(regApellidos);

            if (!esRunValido(regRun.value)) { mostrarError(regRun, 'Ingresa un RUN válido (ej: 19011022K).'); valido = false; } else limpiarError(regRun);

            if (!regCorreo.value.trim() || !esCorreoPermitido(regCorreo.value)) {
                mostrarError(regCorreo, 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                valido = false;
            } else if (leerUsuarios().some(function (u) { return u.correo.toLowerCase() === regCorreo.value.trim().toLowerCase(); })) {
                mostrarError(regCorreo, 'Ya existe una cuenta registrada con ese correo.');
                valido = false;
            } else {
                limpiarError(regCorreo);
            }

            const edad = regFecha.value ? calcularEdad(regFecha.value) : null;
            if (!regFecha.value) {
                mostrarError(regFecha, 'La fecha de nacimiento es obligatoria.');
                valido = false;
            } else if (edad === null || edad < 18) {
                mostrarError(regFecha, 'Debes ser mayor de 18 años para registrarte.');
                valido = false;
            } else {
                limpiarError(regFecha);
            }

            if (regPassword.value.length < 4) { mostrarError(regPassword, 'Mínimo 4 caracteres.'); valido = false; } else limpiarError(regPassword);
            if (regPassword2.value !== regPassword.value || !regPassword2.value) { mostrarError(regPassword2, 'Las contraseñas no coinciden.'); valido = false; } else limpiarError(regPassword2);

            if (!regRegion.value) { mostrarError(regRegion, 'Selecciona tu región.'); valido = false; } else limpiarError(regRegion);
            if (!regComuna.value) { mostrarError(regComuna, 'Selecciona tu comuna.'); valido = false; } else limpiarError(regComuna);
            if (!regDireccion.value.trim()) { mostrarError(regDireccion, 'La dirección es obligatoria.'); valido = false; } else limpiarError(regDireccion);

            if (!valido) {
                const primerError = formRegistro.querySelector('.is-invalid');
                if (primerError) primerError.focus();
                return;
            }

                        const esDuoc = esCorreoDuoc(regCorreo.value);
            const usuarios = leerUsuarios();

            const codigoIngresado = regCodigoReferido.value.trim().toUpperCase();
            const referente = codigoIngresado
                ? usuarios.find(function (u) { return u.codigoReferido === codigoIngresado; })
                : null;

            if (codigoIngresado && !referente) {
                mostrarError(regCodigoReferido, 'Ese código de referido no existe.');
                const primerError = formRegistro.querySelector('.is-invalid');
                if (primerError) primerError.focus();
                return;
            }
            limpiarError(regCodigoReferido);

            const nuevoUsuario = {
                nombre: regNombre.value.trim(),
                apellidos: regApellidos.value.trim(),
                run: regRun.value.trim().toUpperCase(),
                correo: regCorreo.value.trim(),
                password: regPassword.value,
                fechaNacimiento: regFecha.value,
                telefono: regTelefono.value.trim(),
                region: regRegion.value,
                comuna: regComuna.value,
                direccion: regDireccion.value.trim(),
                esDuoc: esDuoc,
                descuento: esDuoc ? 20 : 0,
                preferencias: [],
                codigoReferido: generarCodigoReferido(regNombre.value.trim(), regApellidos.value.trim()),
                referidoPor: referente ? referente.correo : null,
                referidos: [],
                puntosLevelUp: referente ? PUNTOS_BONUS_REFERIDO_NUEVO : 0,
                canjes: [],
                fechaRegistro: new Date().toISOString()
            };

            usuarios.push(nuevoUsuario);

            if (referente) {
                referente.puntosLevelUp += PUNTOS_POR_REFERIDO;
                referente.referidos = referente.referidos || [];
                referente.referidos.push(nuevoUsuario.correo);
            }

            guardarUsuarios(usuarios);
            guardarSesion(nuevoUsuario.correo);

            let mensaje = esDuoc ? '¡Cuenta creada! Tienes 20% de descuento de por vida por tu correo institucional.' : '¡Cuenta creada con éxito!';
            if (referente) mensaje += ' Ganaste ' + PUNTOS_BONUS_REFERIDO_NUEVO + ' puntos Level-Up por usar un código de referido.';
            registroSuccess.textContent = mensaje + ' Redirigiendo...';

            window.setTimeout(function () {
                window.location.href = 'perfil.html';
            }, 1500);
        });
    }

    //Formulario de login (login.html)

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        const loginCorreo = document.getElementById('login-correo');
        const loginPassword = document.getElementById('login-password');
        const loginError = document.getElementById('login-error');
        const loginSuccess = document.getElementById('login-success');

        formLogin.addEventListener('submit', function (evento) {
            evento.preventDefault();
            loginError.textContent = '';
            loginError.classList.remove('show');

            const usuario = leerUsuarios().find(function (u) {
                return u.correo.toLowerCase() === loginCorreo.value.trim().toLowerCase() && u.password === loginPassword.value;
            });

            if (!usuario) {
                loginError.textContent = 'Correo o contraseña incorrectos.';
                loginError.classList.add('show', 'error');
                return;
            }

            guardarSesion(usuario.correo);
            loginSuccess.textContent = 'Sesión iniciada. Redirigiendo...';
            window.setTimeout(function () {
                window.location.href = 'perfil.html';
            }, 1000);
        });
    }

    //Página de perfil (perfil.html)

    const perfilContenido = document.getElementById('perfil-contenido');
    if (perfilContenido) {
        const usuarioActual = obtenerUsuarioActual();

        if (!usuarioActual) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('perfil-nombre').textContent = usuarioActual.nombre + ' ' + usuarioActual.apellidos;
            document.getElementById('perfil-correo').textContent = usuarioActual.correo;
            document.getElementById('perfil-run').textContent = usuarioActual.run;
            document.getElementById('perfil-puntos').textContent = usuarioActual.puntosLevelUp;

                        // Nivel y progreso
            const infoNivel = obtenerNivelActual(usuarioActual.puntosLevelUp);
            document.getElementById('perfil-nivel').textContent = infoNivel.actual.nombre;
            document.getElementById('perfil-nivel-barra').style.width = infoNivel.progreso + '%';
            document.getElementById('perfil-nivel-siguiente').textContent = infoNivel.siguiente
                ? 'Te faltan ' + (infoNivel.siguiente.puntosMin - usuarioActual.puntosLevelUp) + ' puntos para llegar a ' + infoNivel.siguiente.nombre + '.'
                : '¡Alcanzaste el nivel máximo!';

            // Código y contador de referidos
            document.getElementById('perfil-codigo-referido').textContent = usuarioActual.codigoReferido;
            document.getElementById('perfil-referidos-count').textContent = (usuarioActual.referidos || []).length;

            const btnCopiarCodigo = document.getElementById('btn-copiar-codigo');
            if (btnCopiarCodigo) {
                btnCopiarCodigo.addEventListener('click', function () {
                    navigator.clipboard.writeText(usuarioActual.codigoReferido).then(function () {
                        mostrarToast('Código copiado al portapapeles');
                    });
                });
            }

            // Catálogo de canjes
            const listaCanjes = document.getElementById('perfil-canjes-lista');
            if (listaCanjes) {
                function renderizarCanjes() {
                    const usuarios = leerUsuarios();
                    const usuario = usuarios.find(function (u) { return u.correo === usuarioActual.correo; });
                    listaCanjes.innerHTML = '';

                    CANJES_LEVELUP.forEach(function (canje) {
                        const puedeCanjear = usuario.puntosLevelUp >= canje.costo;
                        const item = document.createElement('div');
                        item.className = 'canje-item';
                        item.innerHTML =
                            '<div>' +
                                '<strong>' + canje.nombre + '</strong>' +
                                '<p class="text-secondary" style="margin:0;">' + canje.costo + ' puntos</p>' +
                            '</div>' +
                            '<button type="button" class="btn btn-outline-accent btn-canjear" data-id="' + canje.id + '"' + (puedeCanjear ? '' : ' disabled') + '>Canjear</button>';
                        listaCanjes.appendChild(item);
                    });

                    listaCanjes.querySelectorAll('.btn-canjear').forEach(function (boton) {
                        boton.addEventListener('click', function () {
                            const canje = CANJES_LEVELUP.find(function (c) { return c.id === boton.dataset.id; });
                            const usuariosActuales = leerUsuarios();
                            const usuarioActualizado = usuariosActuales.find(function (u) { return u.correo === usuarioActual.correo; });
                            if (!canje || !usuarioActualizado || usuarioActualizado.puntosLevelUp < canje.costo) return;

                            usuarioActualizado.puntosLevelUp -= canje.costo;
                            usuarioActualizado.canjes = usuarioActualizado.canjes || [];
                            usuarioActualizado.canjes.push({ id: canje.id, nombre: canje.nombre, fecha: new Date().toISOString() });
                            guardarUsuarios(usuariosActuales);

                            document.getElementById('perfil-puntos').textContent = usuarioActualizado.puntosLevelUp;
                            mostrarToast('¡Canjeaste "' + canje.nombre + '"!');
                            renderizarCanjes();
                        });
                    });
                }
                renderizarCanjes();
            }

            const badgeDuoc = document.getElementById('perfil-badge-duoc');
            if (badgeDuoc) badgeDuoc.style.display = usuarioActual.esDuoc ? '' : 'none';

            document.getElementById('perfil-telefono').value = usuarioActual.telefono || '';
            document.getElementById('perfil-direccion').value = usuarioActual.direccion || '';

            if (selectRegion) selectRegion.value = usuarioActual.region || '';
            if (selectRegion && selectComuna) {
                selectComuna.innerHTML = '';
                (REGIONES[usuarioActual.region] || []).forEach(function (comuna) {
                    const opcion = document.createElement('option');
                    opcion.value = comuna;
                    opcion.textContent = comuna;
                    if (comuna === usuarioActual.comuna) opcion.selected = true;
                    selectComuna.appendChild(opcion);
                });
                selectComuna.disabled = false;
            }

            document.querySelectorAll('.perfil-preferencia').forEach(function (checkbox) {
                checkbox.checked = usuarioActual.preferencias.indexOf(checkbox.value) !== -1;
            });

            const formPerfil = document.getElementById('formPerfil');
            if (formPerfil) {
                formPerfil.addEventListener('submit', function (evento) {
                    evento.preventDefault();
                    const usuarios = leerUsuarios();
                    const usuario = usuarios.find(function (u) { return u.correo === usuarioActual.correo; });
                    if (!usuario) return;

                    usuario.telefono = document.getElementById('perfil-telefono').value.trim();
                    usuario.direccion = document.getElementById('perfil-direccion').value.trim();
                    usuario.region = selectRegion ? selectRegion.value : usuario.region;
                    usuario.comuna = selectComuna ? selectComuna.value : usuario.comuna;
                    usuario.preferencias = Array.from(document.querySelectorAll('.perfil-preferencia:checked')).map(function (c) { return c.value; });

                    guardarUsuarios(usuarios);
                    mostrarToast('Perfil actualizado');
                });
            }

            const btnCerrarSesionPerfil = document.getElementById('btn-cerrar-sesion-perfil');
            if (btnCerrarSesionPerfil) {
                btnCerrarSesionPerfil.addEventListener('click', function () {
                    cerrarSesion();
                });
            }
        }
    }

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

       //Página de catálogo completo con filtros (productos.html)

    const listadoProductos = document.getElementById('productos-listado');
    if (listadoProductos) {
        const inputBusqueda = document.getElementById('filtro-busqueda');
        const selectCategoria = document.getElementById('filtro-categoria');
        const inputPrecioMin = document.getElementById('filtro-precio-min');
        const inputPrecioMax = document.getElementById('filtro-precio-max');
        const checkStock = document.getElementById('filtro-stock');
        const selectOrden = document.getElementById('filtro-orden');
        const btnLimpiar = document.getElementById('filtro-limpiar');
        const contador = document.getElementById('productos-contador');
        const sinResultados = document.getElementById('productos-sin-resultados');

        // Categorías dinámicas: se arman a partir de PRODUCTOS, así que si agregas
        // productos nuevos (mousepad, servicio técnico, etc.) el filtro se actualiza solo.
        const categorias = Array.from(new Set(PRODUCTOS.map(function (p) { return p.categoria; }))).sort();
        categorias.forEach(function (categoria) {
            const opcion = document.createElement('option');
            opcion.value = categoria;
            opcion.textContent = categoria;
            selectCategoria.appendChild(opcion);
        });

        function normalizar(texto) {
            return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function aplicarFiltros() {
            const termino = normalizar(inputBusqueda.value.trim());
            const categoria = selectCategoria.value;
            const precioMin = inputPrecioMin.value ? Number(inputPrecioMin.value) : null;
            const precioMax = inputPrecioMax.value ? Number(inputPrecioMax.value) : null;
            const soloConStock = checkStock.checked;
            const orden = selectOrden.value;

            let resultado = PRODUCTOS.filter(function (producto) {
                if (termino && normalizar(producto.nombre).indexOf(termino) === -1) return false;
                if (categoria && producto.categoria !== categoria) return false;
                if (precioMin !== null && producto.precio < precioMin) return false;
                if (precioMax !== null && producto.precio > precioMax) return false;
                if (soloConStock && producto.stock <= 0) return false;
                return true;
            });

            switch (orden) {
                case 'precio-asc':
                    resultado.sort(function (a, b) { return a.precio - b.precio; });
                    break;
                case 'precio-desc':
                    resultado.sort(function (a, b) { return b.precio - a.precio; });
                    break;
                case 'nombre-asc':
                    resultado.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
                    break;
                case 'nombre-desc':
                    resultado.sort(function (a, b) { return b.nombre.localeCompare(a.nombre); });
                    break;
                default:
                    // 'relevancia' = orden original del catálogo
                    break;
            }

            listadoProductos.innerHTML = '';
            resultado.forEach(function (producto) {
                listadoProductos.appendChild(crearTarjetaProducto(producto));
            });

            contador.textContent = resultado.length === PRODUCTOS.length
                ? resultado.length + ' producto(s) en el catálogo'
                : 'Mostrando ' + resultado.length + ' de ' + PRODUCTOS.length + ' productos';

            sinResultados.style.display = resultado.length === 0 ? '' : 'none';
            listadoProductos.style.display = resultado.length === 0 ? 'none' : '';
        }

        [inputBusqueda, selectCategoria, inputPrecioMin, inputPrecioMax, checkStock, selectOrden].forEach(function (control) {
            const evento = (control === inputBusqueda || control === inputPrecioMin || control === inputPrecioMax) ? 'input' : 'change';
            control.addEventListener(evento, aplicarFiltros);
        });

        btnLimpiar.addEventListener('click', function () {
            inputBusqueda.value = '';
            selectCategoria.value = '';
            inputPrecioMin.value = '';
            inputPrecioMax.value = '';
            checkStock.checked = false;
            selectOrden.value = 'relevancia';
            aplicarFiltros();
        });

        aplicarFiltros();
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

                            // Reseñas y calificaciones
            const resumenResenas = document.getElementById('detalle-resenas-resumen');
            const listaResenas = document.getElementById('detalle-resenas-lista');
            const formWrapResenas = document.getElementById('detalle-resenas-form-wrap');

            function renderizarResenas() {
                const resenas = obtenerResenasProducto(producto.id).sort(function (a, b) {
                    return new Date(b.fecha) - new Date(a.fecha);
                });
                const promedio = calcularPromedioResenas(producto.id);

                resumenResenas.innerHTML = promedio !== null
                    ? '<div class="resenas-mini">' + renderEstrellas(promedio) + ' <strong>' + promedio.toFixed(1) + '</strong> <span class="text-secondary">(' + resenas.length + ' reseña' + (resenas.length === 1 ? '' : 's') + ')</span></div>'
                    : '<p class="text-secondary">Este producto todavía no tiene reseñas.</p>';

                listaResenas.innerHTML = '';
                if (resenas.length === 0) {
                    listaResenas.innerHTML = '<p class="text-secondary">Sé el primero en dejar tu opinión.</p>';
                } else {
                    resenas.forEach(function (r) {
                        const item = document.createElement('div');
                        item.className = 'resena-item';
                        const fecha = new Date(r.fecha).toLocaleDateString('es-CL');
                        item.innerHTML =
                            '<div class="resena-item-header">' +
                                '<strong>' + r.nombreUsuario + '</strong>' +
                                '<span class="resena-item-fecha">' + fecha + '</span>' +
                            '</div>' +
                            '<div class="resenas-mini">' + renderEstrellas(r.calificacion) + '</div>' +
                            '<p>' + r.comentario + '</p>';
                        listaResenas.appendChild(item);
                    });
                }
            }

            function renderizarFormularioResena() {
                const usuarioActual = obtenerUsuarioActual();

                if (!usuarioActual) {
                    formWrapResenas.innerHTML = '<p class="text-secondary">Debes <a href="login.html">iniciar sesión</a> para dejar una reseña.</p>';
                    return;
                }

                if (!usuarioComproProducto(usuarioActual, producto.id)) {
                    formWrapResenas.innerHTML = '<p class="text-secondary">Solo los clientes que compraron este producto pueden dejar una reseña.</p>';
                    return;
                }

                const yaReseno = leerResenas().some(function (r) {
                    return r.productoId === producto.id && r.correoUsuario === usuarioActual.correo;
                });

                if (yaReseno) {
                    formWrapResenas.innerHTML = '<p class="text-secondary">Ya dejaste una reseña para este producto. ¡Gracias por tu opinión!</p>';
                    return;
                }

                formWrapResenas.innerHTML =
                    '<form id="formResena" class="auth-card" novalidate>' +
                        '<h3 class="auth-card-titulo">Deja tu reseña</h3>' +
                        '<div class="mb-3">' +
                            '<label class="form-label" for="resena-calificacion">Calificación</label>' +
                            '<select class="form-select" id="resena-calificacion" required>' +
                                '<option value="" selected disabled>-- Selecciona --</option>' +
                                '<option value="5">5 - Excelente</option>' +
                                '<option value="4">4 - Muy bueno</option>' +
                                '<option value="3">3 - Bueno</option>' +
                                '<option value="2">2 - Regular</option>' +
                                '<option value="1">1 - Malo</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="mb-3">' +
                            '<label class="form-label" for="resena-comentario">Comentario</label>' +
                            '<textarea class="form-control" id="resena-comentario" rows="3" maxlength="500" required></textarea>' +
                        '</div>' +
                        '<button type="submit" class="btn btn-accent-blue btn-login">Publicar reseña</button>' +
                    '</form>';

                document.getElementById('formResena').addEventListener('submit', function (evento) {
                    evento.preventDefault();
                    const calificacion = Number(document.getElementById('resena-calificacion').value);
                    const comentario = document.getElementById('resena-comentario').value.trim();

                    if (!calificacion || !comentario) return;

                    const resenas = leerResenas();
                    resenas.push({
                        id: Date.now(),
                        productoId: producto.id,
                        correoUsuario: usuarioActual.correo,
                        nombreUsuario: usuarioActual.nombre + ' ' + usuarioActual.apellidos.charAt(0) + '.',
                        calificacion: calificacion,
                        comentario: comentario,
                        fecha: new Date().toISOString()
                    });
                    guardarResenas(resenas);

                    mostrarToast('¡Gracias por tu reseña!');
                    renderizarResenas();
                    renderizarFormularioResena();
                });
            }

            renderizarResenas();
            renderizarFormularioResena();
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

            let subtotalGeneral = 0;

            carrito.forEach(function (item) {
                const producto = PRODUCTOS.find(function (p) { return p.id === item.id; });
                if (!producto) return;

                const subtotal = producto.precio * item.cantidad;
                subtotalGeneral += subtotal;

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

            const usuarioCarrito = obtenerUsuarioActual();
            const descuentoPct = usuarioCarrito ? usuarioCarrito.descuento : 0;
            const montoDescuento = Math.round(subtotalGeneral * descuentoPct / 100);
            const totalFinal = subtotalGeneral - montoDescuento;

            document.getElementById('carrito-subtotal').textContent = formatearPrecio(subtotalGeneral);

            const lineaDescuento = document.getElementById('carrito-descuento-linea');
            if (descuentoPct > 0) {
                lineaDescuento.style.display = '';
                document.getElementById('carrito-descuento-label').textContent = 'Descuento Duoc (' + descuentoPct + '%):';
                document.getElementById('carrito-descuento').textContent = '-' + formatearPrecio(montoDescuento);
            } else {
                lineaDescuento.style.display = 'none';
            }

            carritoTotalEl.textContent = formatearPrecio(totalFinal);

            const puntosPreview = document.getElementById('carrito-puntos-preview');
            if (puntosPreview) {
                const puntosAGanar = Math.floor(totalFinal / 1000) * PUNTOS_POR_CADA_1000_CLP;
                puntosPreview.textContent = usuarioCarrito
                    ? 'Ganarás ' + puntosAGanar + ' puntos Level-Up con esta compra.'
                    : 'Inicia sesión para ganar puntos Level-Up con tus compras.';
            }

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
                 const carritoActual = leerCarrito();
                 if (carritoActual.length === 0) return;

                 const usuarioCarrito = obtenerUsuarioActual();
                 let mensaje = '¡Gracias por tu compra!';

                 if (usuarioCarrito) {
                    const subtotal = carritoActual.reduce(function (acum, item) {
                        const producto = PRODUCTOS.find(function (p) { return p.id === item.id; });
                        return acum + (producto ? producto.precio * item.cantidad : 0);
                    }, 0);
                    const totalFinal = subtotal - Math.round(subtotal * usuarioCarrito.descuento / 100);
                    const puntosGanados = Math.floor(totalFinal / 1000) * PUNTOS_POR_CADA_1000_CLP;

                                        const usuarios = leerUsuarios();
                    const usuario = usuarios.find(function (u) { return u.correo === usuarioCarrito.correo; });
                    if (usuario) {
                        usuario.puntosLevelUp += puntosGanados;
                        usuario.historialCompras = usuario.historialCompras || [];
                        usuario.historialCompras.push({
                            productos: carritoActual.map(function (item) { return { id: item.id, cantidad: item.cantidad }; }),
                            total: totalFinal,
                            fecha: new Date().toISOString()
                        });
                        guardarUsuarios(usuarios);
                        mensaje = '¡Gracias por tu compra! Ganaste ' + puntosGanados + ' puntos Level-Up.';
                    }
                }

                guardarCarrito([]);
                renderizarCarrito();
                mostrarToast(mensaje);
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