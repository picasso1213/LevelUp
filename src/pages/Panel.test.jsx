import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { abrirApp, conSesion, crearBoleta, crearUsuario } from '../test/utils.jsx'

const admin = () => crearUsuario({ id: 10, correo: 'admin@levelup.cl', nombre: 'Admin', apellidos: 'Level-Up', rol: 'ADMIN' })
const vendedor = () => crearUsuario({ id: 11, correo: 'vendedor@levelup.cl', nombre: 'Vendedor', apellidos: 'Level-Up', rol: 'VENDEDOR' })

describe('Panel · productos', () => {
  it('el ADMIN ve la lista con los botones de editar y eliminar', async () => {
    abrirApp('/panel/productos', conSesion(admin()))
    const tabla = await screen.findByRole('table', { name: 'Lista de productos' })
    expect(within(tabla).getByText('PlayStation 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo producto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar PlayStation 5' })).toBeInTheDocument()
  })

  it('el VENDEDOR solo puede ver la lista: no hay botones de gestión', async () => {
    abrirApp('/panel/productos', conSesion(vendedor()))
    await screen.findByRole('table', { name: 'Lista de productos' })
    expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
  })

  it('el ADMIN edita el precio de un producto (PUT /productos/:id)', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/panel/productos', conSesion(admin()))
    await usuario.click(await screen.findByRole('button', { name: 'Editar Mouse Logitech G502 HERO' }))

    const precio = screen.getByLabelText('Precio (CLP)')
    await usuario.clear(precio)
    await usuario.type(precio, '45990')
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Producto actualizado')).toBeInTheDocument()
    expect(api.estado.productos.find((p) => p.id === 5).precio).toBe(45990)
  })

  it('crear un producto sin nombre muestra el error y no llama al backend', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/panel/productos', conSesion(admin()))
    await usuario.click(await screen.findByRole('button', { name: 'Nuevo producto' }))
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una categoría.')).toBeInTheDocument()
    expect(api.estado.peticiones.some((p) => p.metodo === 'POST' && p.ruta === '/productos')).toBe(false)
  })

  it('el ADMIN crea un producto nuevo (POST /productos)', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/panel/productos', conSesion(admin()))
    await usuario.click(await screen.findByRole('button', { name: 'Nuevo producto' }))

    await usuario.type(screen.getByLabelText('Nombre'), 'Teclado Mecánico')
    await usuario.selectOptions(await screen.findByLabelText('Categoría'), 'Accesorios')
    await usuario.type(screen.getByLabelText('Precio (CLP)'), '39990')
    await usuario.type(screen.getByLabelText('Stock'), '12')
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Producto creado')).toBeInTheDocument()
    expect(api.estado.productos.at(-1)).toMatchObject({ nombre: 'Teclado Mecánico', precio: 39990, stock: 12 })
  })

  it('eliminar pide confirmación y borra el producto (DELETE /productos/:id)', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/panel/productos', conSesion(admin()))
    await usuario.click(await screen.findByRole('button', { name: 'Eliminar Mouse Logitech G502 HERO' }))
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()

    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Producto eliminado')).toBeInTheDocument()
    expect(api.estado.productos.some((p) => p.id === 5)).toBe(false)
  })

  it('cancelar la confirmación no elimina nada', async () => {
    const usuario = userEvent.setup()
    const { api } = abrirApp('/panel/productos', conSesion(admin()))
    await usuario.click(await screen.findByRole('button', { name: 'Eliminar Mouse Logitech G502 HERO' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(api.estado.productos.some((p) => p.id === 5)).toBe(true)
  })
})

describe('Panel · órdenes', () => {
  it('el VENDEDOR ve las órdenes de todos los clientes y abre el detalle', async () => {
    const usuario = userEvent.setup()
    abrirApp('/panel/ordenes', conSesion(vendedor(), { boletas: [crearBoleta()] }))

    const tabla = await screen.findByRole('table', { name: 'Lista de órdenes' })
    expect(within(tabla).getByText('Ana Pérez')).toBeInTheDocument()
    expect(within(tabla).getByText('ana@gmail.com')).toBeInTheDocument()

    await usuario.click(within(tabla).getByRole('button', { name: 'Ver' }))
    expect(screen.getByText(/1 × Mouse Logitech G502 HERO/)).toBeInTheDocument()
  })

  it('sin órdenes muestra un mensaje', async () => {
    abrirApp('/panel/ordenes', conSesion(admin()))
    expect(await screen.findByText('Aún no hay órdenes.')).toBeInTheDocument()
  })
})

describe('Panel · usuarios', () => {
  it('el ADMIN cambia el rol de otro usuario (PUT /usuarios/:id/rol)', async () => {
    const usuario = userEvent.setup()
    const cliente = crearUsuario({ id: 1, correo: 'ana@gmail.com' })
    const { api } = abrirApp('/panel/usuarios', { usuarios: [admin(), cliente], sesion: { correo: 'admin@levelup.cl' } })

    await usuario.selectOptions(await screen.findByLabelText('Rol de Ana'), 'VENDEDOR')

    expect(await screen.findByText('Rol de Ana actualizado')).toBeInTheDocument()
    expect(api.estado.usuarios.find((u) => u.id === 1).rol).toBe('VENDEDOR')
  })

  it('el ADMIN no puede cambiarse el rol ni eliminarse a sí mismo', async () => {
    abrirApp('/panel/usuarios', conSesion(admin()))
    expect(await screen.findByLabelText('Rol de Admin')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar a Admin' })).toBeDisabled()
  })
})
