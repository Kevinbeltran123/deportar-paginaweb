import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { FormularioClienteV2 } from '../../../components/clientes/FormularioClienteV2'

const mockUseAuth = vi.fn()

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}))

vi.mock('../../../services', () => {
  const crearCliente = vi.fn()
  const actualizarCliente = vi.fn()
  const obtenerClientePorId = vi.fn()

  return {
    crearCliente,
    actualizarCliente,
    obtenerClientePorId
  }
})

import { crearCliente, actualizarCliente, obtenerClientePorId } from '../../../services'

describe('FormularioClienteV2', () => {
  beforeEach(() => {
    mockUseAuth.mockReset()
    crearCliente.mockReset()
    actualizarCliente.mockReset()
    obtenerClientePorId.mockReset()
  })

  it('muestra mensaje de autenticación requerida cuando el usuario no está autenticado', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false })

    render(<FormularioClienteV2 />)

    expect(screen.getByText(/debes iniciar sesión para continuar/i)).toBeInTheDocument()
  })

  it('muestra errores de validación al intentar enviar sin datos requeridos', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true })

    render(<FormularioClienteV2 />)

    const submitButton = screen.getByRole('button', { name: /crear cliente/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
    })

    expect(crearCliente).not.toHaveBeenCalled()
  })

  it('envía los datos y ejecuta onSuccess cuando el formulario es válido', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true })
    crearCliente.mockResolvedValue({
      idCliente: 10,
      nombre: 'Ana',
      apellido: 'López'
    })

    const onSuccess = vi.fn()
    render(<FormularioClienteV2 onSuccess={onSuccess} />)

    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nombre/i), '  Ana  ')
    await user.type(screen.getByLabelText(/apellido/i), '  López  ')
    await user.type(screen.getByLabelText(/número de documento/i), ' 99887766 ')
    await user.type(screen.getByLabelText(/email/i), 'ana@example.com')

    const submitButton = screen.getByRole('button', { name: /crear cliente/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(crearCliente).toHaveBeenCalledTimes(1)
    })

    expect(crearCliente).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'López',
      documento: '99887766',
      tipoDocumento: 'CC',
      email: 'ana@example.com'
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('carga la información del cliente cuando se recibe un clienteId', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true })
    obtenerClientePorId.mockResolvedValue({
      nombre: 'Laura',
      apellido: 'Suárez',
      documento: '55443322',
      tipoDocumento: 'CE',
      email: 'laura@example.com',
      telefono: '3000000000',
      direccion: 'Calle 90'
    })

    render(<FormularioClienteV2 clienteId={5} />)

    await waitFor(() => {
      expect(obtenerClientePorId).toHaveBeenCalledWith(5)
    })

    expect(screen.getByDisplayValue('Laura')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Suárez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('55443322')).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando actualizarCliente lanza una excepción', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true })
    obtenerClientePorId.mockResolvedValue({
      nombre: 'Carlos',
      apellido: 'Mendoza',
      documento: '11223344',
      tipoDocumento: 'CC',
      email: '',
      telefono: '',
      direccion: ''
    })
    actualizarCliente.mockRejectedValue({
      response: { status: 400, data: { message: 'Datos inválidos' } }
    })

    render(<FormularioClienteV2 clienteId={7} />)

    await waitFor(() => expect(obtenerClientePorId).toHaveBeenCalledWith(7))

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /actualizar cliente/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/datos inválidos: datos inválidos/i)
      ).toBeInTheDocument()
    })
  })
})
