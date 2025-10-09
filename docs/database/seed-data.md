## Estado actual
- No existe un script de datos de ejemplo versionado en el repositorio.
- Los catálogos (tipos de equipo, destinos de prueba, clientes demo) deben crearse manualmente o mediante llamadas a la API durante la puesta en marcha.

## Estrategia sugerida
1. **Definir script base** (`docs/database/seed.sql` o migración `V2__seed_reference_data.sql`) con:
   - Tipos de documento.
   - Tipos de equipo comunes.
   - Destinos iniciales con coordenadas básicas.
   - Políticas de precio preconfiguradas (por ejemplo, descuentos por fidelización).
2. **Crear usuarios demo**:
   - Para Auth0, usa el dashboard para invitar o crear usuarios de prueba.
   - Para la tabla `usuario`, incluye registros si alguna tarea interna los requiere.
3. **Semillas dinámicas desde la API**:
   - Scripts de Postman/Insomnia o un archivo `seed.js` que utilice la API segura para generar datos y validar la integración end-to-end.

## Recomendaciones
- Mantén las semillas pequeñas y enfocadas: suficientes para demostrar flujos (1 destino, 3 equipos, 2 clientes, 1 política).
- Documenta en este archivo cada lote de datos que se agregue (qué entidades crea y por qué).
- Si usas entornos compartidos (QA, staging), evita incluir datos sensibles en las semillas. Prefiere nombres genéricos.
