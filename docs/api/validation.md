## Validaciones en la capa de entrada
- Los DTO de solicitud (`com.deportur.dto.request`) usan anotaciones de **Jakarta Bean Validation**:
  - `@NotNull`, `@NotBlank`, `@Size`, `@Email`, etc.
  - En controladores, los parámetros se anotan con `@Valid` para activar la validación automática.
- Ejemplos:
  - `CrearReservaRequest` exige cliente, destino, fechas e IDs de equipos.
  - `CrearClienteRequest` valida nombre, apellido, documento y tipo de documento.

## Reglas de negocio en servicios
- Los servicios refuerzan validaciones más complejas:
  - `ReservaService` verifica disponibilidad de equipos, rango de fechas y existencia de cliente/destino.
  - `PoliticaPrecioService` controla que `minDias <= maxDias`, porcentajes entre 0 y 100, fechas consistentes.
  - `DestinoService` valida coordenadas dentro de rangos válidos y capacidad no negativa.
  - `EquipoService` evita fechas de adquisición futuras y asegura precio positivo.

## Validaciones personalizadas en repositorios
- Consultas como `DetalleReservaRepository.existsReservaEnFechas` previenen solapamiento de reservas.
- `ClienteRepository.findByDocumento` se usa para garantizar unicidad del documento antes de crear o actualizar un cliente.

## Flujo de errores al frontend
- Si una validación falla en la capa de DTO, `GlobalExceptionHandler` devuelve un mapa de errores (`400`).
- Si la validación se realiza en el servicio y lanza `Exception`, el controlador responde con `400` y el mensaje correspondiente.

## Buenas prácticas para nuevas validaciones
- Prefiere anotar los DTO con reglas básicas para tener respuestas inmediatas.
- Mantén las reglas empresariales complejas en los servicios para reutilizarlas desde distintos flujos (REST, jobs, etc.).
- Documenta mensajes claros; evita textos genéricos como “Error de validación”.
- Agrega pruebas unitarias o de integración cuando se incorporen nuevas reglas críticas (por ejemplo, políticas de fidelización).
