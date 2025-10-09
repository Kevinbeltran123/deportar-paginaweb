## Manejo centralizado en el backend
- `GlobalExceptionHandler` (`com.deportur.exception.GlobalExceptionHandler`) intercepta excepciones comunes y responde en formato JSON.
- Respuestas típicas:
  - **Validación (`MethodArgumentNotValidException`)**
    - Código `400`
    - Cuerpo `{ "campo": "mensaje de error" }`
  - **IllegalArgumentException / RuntimeException**
    - Código `400`
    - Cuerpo `{ "error": "mensaje descriptivo" }`
  - **Exception genérica**
    - Código `500`
    - Cuerpo `{ "error": "mensaje" }`

## Convenciones sugeridas para controladores/servicios
- Lanza `Exception` con mensajes comprensibles cuando una regla de negocio falla (por ejemplo, “El equipo ya está reservado en las fechas seleccionadas”).
- Para recursos inexistentes, devuelve `ResponseEntity.notFound().build()` o lanza una excepción específica y mapéala a `404`.
- Para conflictos por estado o permisos, devuelve `ResponseEntity.status(HttpStatus.BAD_REQUEST)` con mensaje claro.

## Tratamiento en el frontend
- El interceptor de Axios registra los errores y deja la excepción disponible para que cada componente la maneje.
- Patrones comunes:
  - Mostrar `alert()` o modales informativos con el mensaje devuelto por el backend.
  - Si el `status` es `401`, redirigir al login.
  - Si es `403`, informar que no se tienen permisos.
  - En `404`, mostrar que el recurso no existe o refrescar la lista.

## Formato consistente
- Mantén la clave `error` o `message` en respuestas personalizadas para que el frontend pueda mostrar mensajes sin lógica adicional.
- Cuando se devuelven varias validaciones, usa un mapa con nombreCampo → mensaje, como hace `handleValidationExceptions`.

## Logs y monitoreo
- Los servicios registran errores relevantes (`logger.error`) para facilitar trazabilidad.
- En ambientes productivos, considera integrar un sistema de observabilidad (ex. ELK, Cloud Logging) para auditar excepciones recurrentes.
