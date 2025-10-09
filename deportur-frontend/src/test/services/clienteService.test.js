import { describe, it, expect } from 'vitest'
import {
  listarClientes,
  crearCliente,
  obtenerClientePorId,
  eliminarCliente,
  buscarClientes
} from '../../services/clienteService'

describe('clienteService', () => {
  it('listarClientes devuelve la lista completa de clientes', async () => {
    const clientes = await listarClientes()

    expect(Array.isArray(clientes)).toBe(true)
    expect(clientes.length).toBeGreaterThanOrEqual(2)
    expect(clientes[0]).toMatchObject({
      nombre: expect.any(String),
      documento: expect.any(String)
    })
  })

  it('crearCliente envía el payload correcto y retorna el cliente creado', async () => {
    const nuevoCliente = {
      nombre: 'Sofía',
      apellido: 'Ramírez',
      documento: '44556677',
      tipoDocumento: 'PASAPORTE',
      email: 'sofia@example.com'
    }

    const resultado = await crearCliente(nuevoCliente)

    expect(resultado).toMatchObject({
      id: expect.any(Number),
      nombre: 'Sofía',
      documento: '44556677'
    })

    const clientes = await listarClientes()
    expect(clientes.some((cliente) => cliente.documento === '44556677')).toBe(true)
  })

  it('obtenerClientePorId lanza error cuando el cliente no existe', async () => {
    await expect(obtenerClientePorId(999)).rejects.toHaveProperty('response.status', 404)
  })

  it('buscarClientes filtra por nombre o apellido', async () => {
    const resultados = await buscarClientes('pér')

    expect(resultados).not.toHaveLength(0)
    expect(
      resultados.every((cliente) =>
        `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes('pér'.toLowerCase())
      )
    ).toBe(true)
  })

  it('eliminarCliente elimina el registro y responde sin error', async () => {
    await eliminarCliente(1)

    const clientes = await listarClientes()
    expect(clientes.every((cliente) => cliente.id !== 1 && cliente.idCliente !== 1)).toBe(true)
  })
})
