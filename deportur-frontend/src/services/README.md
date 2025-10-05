# Servicios de API - DeporTur

Servicios para conectar el frontend React con el backend Spring Boot usando Axios y autenticación JWT con Auth0.

## Configuración Inicial

Para usar los servicios, primero debes configurar el token getter en tu componente raíz (App.jsx):

```javascript
import { useAuth0 } from '@auth0/auth0-react';
import { setTokenGetter } from './services';
import { useEffect } from 'react';

function App() {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Configurar función para obtener token JWT
    setTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  return (
    // Tu aplicación...
  );
}
```

## Uso de los Servicios

### Importación

```javascript
// Importar servicios individuales
import { listarClientes, crearCliente } from './services/clienteService';

// O importar desde el índice
import { listarClientes, crearReserva, listarDestinos } from './services';
```

### Ejemplos de Uso

#### Cliente Service

```javascript
import {
  listarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes
} from './services';

// Listar todos los clientes
const clientes = await listarClientes();

// Obtener cliente por ID
const cliente = await obtenerClientePorId(1);

// Buscar clientes
const resultados = await buscarClientes('Juan');

// Crear nuevo cliente
const nuevoCliente = await crearCliente({
  nombre: 'Juan',
  apellido: 'Pérez',
  documento: '12345678',
  tipoDocumento: 'DNI',
  telefono: '+54 11 1234-5678',
  email: 'juan@example.com',
  direccion: 'Calle Falsa 123'
});

// Actualizar cliente
const actualizado = await actualizarCliente(1, {
  telefono: '+54 11 9999-9999'
});

// Eliminar cliente
await eliminarCliente(1);
```

#### Reserva Service

```javascript
import {
  listarReservas,
  crearReserva,
  obtenerReservasPorCliente,
  cambiarEstadoReserva,
  cancelarReserva
} from './services';

// Crear nueva reserva
const reserva = await crearReserva({
  idCliente: 1,
  idDestino: 2,
  fechaInicio: '2024-12-01',
  fechaFin: '2024-12-07',
  equipos: [1, 3, 5],
  montoTotal: 150.00,
  estado: 'PENDIENTE'
});

// Obtener reservas de un cliente
const reservasCliente = await obtenerReservasPorCliente(1);

// Cambiar estado de reserva
await cambiarEstadoReserva(1, 'CONFIRMADA');

// Cancelar reserva
await cancelarReserva(1);
```

#### Equipo Service

```javascript
import {
  listarEquipos,
  obtenerEquiposDisponibles,
  crearEquipo
} from './services';

// Obtener equipos disponibles
const disponibles = await obtenerEquiposDisponibles({
  destinoId: 2,
  fechaInicio: '2024-12-01',
  fechaFin: '2024-12-07'
});

// Crear equipo
const equipo = await crearEquipo({
  nombre: 'Bicicleta Mountain Bike Pro',
  descripcion: 'Bicicleta de montaña profesional',
  precioDia: 25.00,
  idTipoEquipo: 1,
  idDestino: 2,
  estado: 'DISPONIBLE'
});
```

#### Destino Service

```javascript
import {
  listarDestinos,
  obtenerDestinoPorId,
  crearDestino
} from './services';

// Listar destinos
const destinos = await listarDestinos();

// Crear destino
const destino = await crearDestino({
  nombre: 'Bariloche',
  descripcion: 'Ciudad turística en la Patagonia',
  ubicacion: 'Río Negro, Argentina',
  pais: 'Argentina',
  ciudad: 'San Carlos de Bariloche',
  imagen: 'https://example.com/bariloche.jpg'
});
```

#### Tipo Equipo Service

```javascript
import {
  listarTiposEquipo,
  crearTipoEquipo
} from './services';

// Listar tipos de equipo
const tipos = await listarTiposEquipo();

// Crear tipo de equipo
const tipo = await crearTipoEquipo({
  nombre: 'Kayak',
  descripcion: 'Embarcaciones para deportes acuáticos',
  categoria: 'Acuático'
});
```

## Manejo de Errores

Todos los servicios usan try/catch internamente y lanzan errores que puedes capturar:

```javascript
import { listarClientes } from './services';

try {
  const clientes = await listarClientes();
  console.log(clientes);
} catch (error) {
  if (error.response) {
    // Error de respuesta del servidor
    console.error('Error del servidor:', error.response.status);
    console.error('Mensaje:', error.response.data);
  } else if (error.request) {
    // Error de red
    console.error('Error de red - sin respuesta del servidor');
  } else {
    // Otro tipo de error
    console.error('Error:', error.message);
  }
}
```

## Uso con React Query

Ejemplo de integración con @tanstack/react-query:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarClientes, crearCliente } from './services';

function Clientes() {
  const queryClient = useQueryClient();

  // Query para listar
  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes
  });

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: crearCliente,
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
    }
  });

  const handleCrear = (datos) => {
    createMutation.mutate(datos);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {clientes?.map(cliente => (
        <div key={cliente.id}>{cliente.nombre}</div>
      ))}
    </div>
  );
}
```

## Endpoints Disponibles

### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Obtener por ID
- `GET /api/clientes/buscar?nombre={nombre}` - Buscar
- `GET /api/clientes/documento/{documento}` - Por documento
- `POST /api/clientes` - Crear
- `PUT /api/clientes/{id}` - Actualizar
- `DELETE /api/clientes/{id}` - Eliminar

### Reservas
- `GET /api/reservas` - Listar todas
- `GET /api/reservas/{id}` - Obtener por ID
- `GET /api/reservas/cliente/{clienteId}` - Por cliente
- `GET /api/reservas/destino/{destinoId}` - Por destino
- `POST /api/reservas` - Crear
- `PUT /api/reservas/{id}/estado?estado={estado}` - Cambiar estado
- `DELETE /api/reservas/{id}` - Cancelar

### Equipos
- `GET /api/equipos` - Listar todos
- `GET /api/equipos/{id}` - Obtener por ID
- `GET /api/equipos/disponibles?destinoId={id}&fechaInicio={fecha}&fechaFin={fecha}` - Disponibles
- `GET /api/equipos/tipo/{idTipo}` - Por tipo
- `GET /api/equipos/destino/{idDestino}` - Por destino
- `POST /api/equipos` - Crear
- `PUT /api/equipos/{id}` - Actualizar
- `DELETE /api/equipos/{id}` - Eliminar

### Destinos
- `GET /api/destinos` - Listar todos
- `GET /api/destinos/{id}` - Obtener por ID
- `GET /api/destinos/buscar?termino={termino}` - Buscar
- `POST /api/destinos` - Crear
- `PUT /api/destinos/{id}` - Actualizar
- `DELETE /api/destinos/{id}` - Eliminar

### Tipos de Equipo
- `GET /api/tipos-equipo` - Listar todos
- `GET /api/tipos-equipo/{id}` - Obtener por ID
- `POST /api/tipos-equipo` - Crear
- `PUT /api/tipos-equipo/{id}` - Actualizar
- `DELETE /api/tipos-equipo/{id}` - Eliminar

## Notas Importantes

1. **Autenticación JWT**: Todos los requests incluyen automáticamente el token JWT en el header `Authorization: Bearer {token}`
2. **Manejo de errores**: Los interceptores manejan errores 401, 403, 404, 500 automáticamente
3. **Base URL**: Configurada desde `VITE_API_URL` en el archivo .env
4. **Formato de respuesta**: Spring Boot retorna `ResponseEntity`, los servicios extraen automáticamente `.data`
