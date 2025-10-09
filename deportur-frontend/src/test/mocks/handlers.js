import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8080/api'

let clientesDB = [
  {
    id: 1,
    idCliente: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    documento: '12345678',
    tipoDocumento: 'CC',
    email: 'juan@example.com',
    telefono: '3001234567',
    direccion: 'Calle 123'
  },
  {
    id: 2,
    idCliente: 2,
    nombre: 'María',
    apellido: 'García',
    documento: '87654321',
    tipoDocumento: 'CC',
    email: 'maria@example.com',
    telefono: '3019876543',
    direccion: 'Carrera 45'
  }
]

const findClienteById = (id) =>
  clientesDB.find((cliente) => cliente.id === Number(id) || cliente.idCliente === Number(id))

const findClienteByDocumento = (documento) =>
  clientesDB.find((cliente) => cliente.documento === documento)

export const handlers = [
  http.get(`${API_URL}/clientes`, () => {
    return HttpResponse.json(clientesDB)
  }),

  http.get(`${API_URL}/clientes/buscar`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase() ?? ''

    const resultados = clientesDB.filter((cliente) => {
      const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase()
      return (
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.apellido.toLowerCase().includes(query) ||
        fullName.includes(query)
      )
    })

    return HttpResponse.json(resultados)
  }),

  http.get(`${API_URL}/clientes/:id`, ({ params }) => {
    const cliente = findClienteById(params.id)
    if (!cliente) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }
    return HttpResponse.json(cliente)
  }),

  http.get(`${API_URL}/clientes/documento/:documento`, ({ params }) => {
    const cliente = findClienteByDocumento(params.documento)
    if (!cliente) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }
    return HttpResponse.json(cliente)
  }),

  http.get(`${API_URL}/clientes/:id/estadisticas`, ({ params }) => {
    const cliente = findClienteById(params.id)
    if (!cliente) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    return HttpResponse.json({
      reservasTotales: 5,
      favorito: 'Cartagena',
      nivelFidelizacion: 'ORO'
    })
  }),

  http.post(`${API_URL}/clientes`, async ({ request }) => {
    const body = await request.json()
    const existente = findClienteByDocumento(body.documento)
    if (existente) {
      return HttpResponse.json('Ya existe un cliente con ese documento', { status: 409 })
    }

    const nuevoCliente = {
      ...body,
      id: clientesDB.length + 1,
      idCliente: clientesDB.length + 1
    }
    clientesDB.push(nuevoCliente)

    return HttpResponse.json(nuevoCliente, { status: 201 })
  }),

  http.put(`${API_URL}/clientes/:id`, async ({ params, request }) => {
    const cliente = findClienteById(params.id)
    if (!cliente) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    Object.assign(cliente, body)
    return HttpResponse.json(cliente)
  }),

  http.delete(`${API_URL}/clientes/:id`, ({ params }) => {
    const cliente = findClienteById(params.id)
    if (!cliente) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    clientesDB = clientesDB.filter((item) => item !== cliente)
    return new HttpResponse(null, { status: 204 })
  })
]

export const resetClientesDB = () => {
  clientesDB = [
    {
      id: 1,
      idCliente: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      tipoDocumento: 'CC',
      email: 'juan@example.com',
      telefono: '3001234567',
      direccion: 'Calle 123'
    },
    {
      id: 2,
      idCliente: 2,
      nombre: 'María',
      apellido: 'García',
      documento: '87654321',
      tipoDocumento: 'CC',
      email: 'maria@example.com',
      telefono: '3019876543',
      direccion: 'Carrera 45'
    }
  ]
}
