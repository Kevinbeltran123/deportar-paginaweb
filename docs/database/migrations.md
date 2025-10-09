## Estado actual
- `spring.flyway.enabled=false` en `application.properties`, por lo que el backend **no ejecuta migraciones automáticamente**.
- El esquema se creó manualmente (o mediante herramientas externas) y Hibernate opera en modo `validate` para asegurar correspondencia.

## Plan recomendado para Flyway
1. **Habilitar Flyway**: definir `spring.flyway.enabled=true` y proveer la URL de conexión.
2. **Crear carpeta de migraciones**: `src/main/resources/db/migration`.
3. **Generar scripts base**:
   - `V1__create_core_tables.sql` con la estructura de clientes, destinos, equipos, reservas, detalles, historial, políticas y usuarios.
   - `V2__seed_reference_data.sql` para catálogos iniciales (tipos de equipo, niveles de fidelización si se desean).
4. **Registrar cambios futuros**:
   - Toda alteración de esquema debe traducirse en una nueva migración (por ejemplo `V3__add_indexes.sql`).

## Buenas prácticas
- Usa comentarios en los scripts para explicar decisiones (índices, constraints).
- Asegúrate de que las migraciones sean idempotentes (Flyway las controla mediante checksum).
- Ejecuta `mvn flyway:validate` en CI para garantizar que el estado de la base coincide con los scripts.
- Documenta en este archivo cada versión agregada y su propósito.

## Alternativa temporal
- Mientras Flyway esté deshabilitado, conserva un script SQL manual (`docs/database/manual-setup.sql`, por crear) que permita reproducir el esquema rápidamente en entornos nuevos.
