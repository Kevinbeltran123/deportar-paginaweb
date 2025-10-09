## Frontend Test Summary (Oct 2025)

- **Infraestructura de pruebas**
  - Vitest configurado con `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
  - MSW (`src/test/mocks`) simula la API REST y reinicia datos entre tests.
  - Archivo `src/test/setup.js` registra MSW, restablece handlers y fija `VITE_API_URL`.

- **Cobertura actual**
  - `FormularioClienteV2.test.jsx`: comprueba render, validaciones, carga inicial por `clienteId`, manejo de errores y flujo exitoso de guardado.
  - `clienteService.test.js`: asegura que los helpers HTTP (listar, crear, buscar, eliminar) utilicen la API correctamente y manejen respuestas 404.

- **Comando**
```bash
cd deportur-frontend
npm test -- --run
```
