## Propósito del proyecto
DeporTur es una plataforma para gestionar reservas de experiencias turísticas deportivas. Incluye:
- Un backend REST en Spring Boot que centraliza reglas de negocio, seguridad y acceso a datos.
- Un frontend en React/Vite que ofrece panel administrativo y flujos operativos para el equipo.
- Un modelo de datos en PostgreSQL que persistente clientes, destinos, equipos, reservas y políticas de precio.

## Cómo está organizado el repositorio
- `deportur-backend/`: servicio Java con APIs protegidas mediante Auth0, integración con PostgreSQL y lógica de tarifas.
- `deportur-frontend/`: aplicación SPA en React que consume las APIs y gestiona autenticación mediante Auth0.
- `docs/`: documentación funcional y técnica segmentada por áreas (backend, frontend, API, base de datos, dominio, pruebas, devops).
- Scripts raíz (`start-backend.sh`, `start-frontend.sh`): facilitan levantar cada servicio con la configuración local.

## Mapa de la documentación
1. **Backend (`docs/backend/`)**: describe arquitectura de capas (controladores, servicios, repositorios), seguridad y configuración.
2. **API (`docs/api/`)**: resume los endpoints disponibles, reglas de autenticación y convenciones de respuesta.
3. **Frontend (`docs/frontend/`)**: explica el enrutamiento, componentes principales y manejo de estado.
4. **Base de datos (`docs/database/`)**: detalla tablas, relaciones y decisiones de modelado.
5. **Dominio (`docs/domain/`)**: captura casos de uso, flujos de usuario y vocabulario.
6. **Pruebas (`docs/testing/`)** y **DevOps (`docs/devops/`)**: lineamientos para asegurar calidad, despliegues y observabilidad.

## Flujo de alto nivel
1. Una persona operadora inicia sesión en el frontend usando Auth0.
2. El frontend obtiene un token JWT, lo añade automáticamente a cada petición y se comunica con el backend.
3. El backend valida el token, aplica reglas de negocio (disponibilidad, políticas de precio, historial) y persiste datos en PostgreSQL.
4. El frontend actualiza su estado con las respuestas (por ejemplo, listados de reservas o confirmaciones).

## Perfiles objetivo
- **Principiante**: encuentra aquí el panorama general y enlaces a cada sección con más detalle.
- **Desarrollador backend**: inicia en `docs/backend/` y `docs/api/`.
- **Desarrollador frontend**: revisa `docs/frontend/`.
- **Equipo de datos/negocio**: consulta `docs/domain/` y `docs/database/`.

Continúa en `docs/backend/overview.md` para profundizar en la arquitectura del servicio backend.
