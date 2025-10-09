## Estado actual
- La API expone rutas bajo el prefijo `/api/` sin versión explícita.
- Dado que el proyecto está en fase activa de construcción, no se ha incorporado versionado por URI.

## Estrategia recomendada
- **Versión por prefijo**: introducir `/api/v1/...` cuando se estabilicen los contratos principales.
- **Header personalizado**: opcionalmente aceptar `Accept: application/vnd.deportur.v1+json` si se requieren múltiples versiones simultáneas.
- **Documentación**: mantener un registro de cambios en este archivo cada vez que se agreguen campos, endpoints o comportamientos incompatibles.

## Buenas prácticas al evolucionar la API
- Usa el versionado sólo para cambios incompatibles (breaking changes). Para mejoras retrocompatibles, extiende el contrato existente.
- Cuando agregues `/api/v2`, conserva `/api/v1` durante un periodo de transición con depreciaciones claras.
- Comunica el calendario de migración en la documentación y, si es posible, expón cabeceras `Deprecation` y `Sunset` para alertar al frontend.

## Pasos futuros
- Actualizar la configuración de Spring (`@RequestMapping("/api/v1/...")`) cuando se cierre la primera versión estable.
- Ajustar el frontend (`VITE_API_URL`) para apuntar a la versión correspondiente.
- Mantener un changelog para cada versión.
