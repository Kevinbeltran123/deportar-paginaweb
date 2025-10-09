import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'
import { resetClientesDB } from './mocks/handlers'

vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api')

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  resetClientesDB()
  vi.restoreAllMocks()
})

afterAll(() => server.close())
