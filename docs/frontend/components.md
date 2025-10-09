## Organización por carpetas
- `components/ui/`: biblioteca de elementos atómicos reutilizables.
- `components/common/`: elementos compartidos entre módulos (barras de navegación, tablas, filtros genéricos).
- `components/clientes/`, `components/destinos/`, `components/equipos/`, `components/reservas/`, `components/politicas/`, `components/tiposEquipo/`: componentes específicos de cada dominio.

## Componentes UI destacados
- `Button`: estilos consistentes para botones primarios, secundarios y de peligro.
- `Modal`: contenedor para formularios o confirmaciones.
- `Table`: tabla genérica con cabeceras y filas personalizables.
- `Badge`: etiquetas de estado (p. ej. fidelización, tipo de documento).
- `Spinner`: indicador de carga.
- `Select`, `Input`, `ToggleSwitch`, `Card`: ayudan a construir formularios y tarjetas uniformes.

## Componentes de dominios
- **Clientes**
  - `ListaClientesV2`: lista con búsqueda, filtros, modales para crear/editar, y vista detallada (`DetalleCliente`).
  - `FormularioClienteV2`: formulario controlado para crear/editar clientes.
- **Destinos**
  - Componentes para listados, formularios y filtros por ubicación.
- **Equipos**
  - Interfaces para administrar inventario, estados y disponibilidad.
- **Reservas**
  - Componentes para listar reservas, consultar historial y gestionar flujos de confirmación/cancelación.
- **Políticas**
  - Formularios para crear políticas, seleccionar destino/tipo/equipo y definir porcentajes.
- **Tipos de equipo**
  - Listados simples para mantener catálogos de categorías.

## Componentes de seguridad y navegación
- `ProtectedRoute` y `AdminRoute`: controlan acceso según autenticación y roles.
- `Dashboard` (página) consume un conjunto de tarjetas de navegación con íconos de `lucide-react`.

## Convenciones
- Cada componente expone sus props necesarias y maneja su estado interno (por ejemplo, modales controlan su apertura desde el padre).
- Estado compartido se pasa por props o hooks personalizados; no se usa Redux u otro store global.
- Los mensajes y textos están en español para empatía con usuarios operativos.

## Extensión
- Al crear un componente nuevo:
  1. Decide si es reusable (`ui/`) o propio del dominio (`<dominio>/`).
  2. Expone callbacks para acciones (guardar, eliminar, cerrar modal).
  3. Documenta en esta sección su responsabilidad cuando se vuelva parte estable del flujo.
