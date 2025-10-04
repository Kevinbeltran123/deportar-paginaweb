# ✅ Checklist de Migración DeporTur a Web

**Proyecto:** DeporTur - Sistema de Alquiler de Equipos Deportivos  
**Objetivo:** Migrar de Java Desktop a Web (Spring Boot + React)

---

## 🎯 SEMANA 0: PREPARACIÓN (Días 1-4)

### Día 1: Diseño y Planeación
- [ ] Crear cuenta en Figma
- [ ] Explorar plantillas de dashboards en Figma Community
- [ ] Seleccionar paleta de colores (primario, secundario, estados)
- [ ] Crear wireframes de:
  - [ ] Pantalla de login
  - [ ] Dashboard principal
  - [ ] Lista de reservas
  - [ ] Formulario de nueva reserva
  - [ ] Lista de inventario
  - [ ] Lista de clientes
  - [ ] Lista de destinos
  - [ ] Panel de usuarios (admin)
- [ ] Definir flujos de navegación

### Día 2: Completar Mockups
- [ ] Convertir wireframes a alta fidelidad
- [ ] Crear componentes reutilizables (botones, tarjetas, formularios, tablas, modales)
- [ ] Diseñar versión móvil
- [ ] Crear prototipo interactivo en Figma
- [ ] Probar flujo con 2-3 personas
- [ ] Hacer ajustes según feedback

### Día 3: Configuración de Cuentas

#### Auth0
- [ ] Crear cuenta en Auth0
- [ ] Crear aplicación "DeporTur Frontend" (SPA)
- [ ] Copiar Domain y Client ID
- [ ] Configurar URLs: Callback, Logout, Web Origins (`http://localhost:5173`)
- [ ] Habilitar Google en Authentication → Social
- [ ] Crear API "DeporTur API" (identifier: `https://deportur-api.com`)
- [ ] Agregar permisos: read/write para reservas, clientes, equipos, admin:all
- [ ] Guardar todas las credenciales

#### Railway
- [ ] Crear cuenta en Railway
- [ ] Crear proyecto "DeporTur Backend"
- [ ] Agregar servicio MySQL
- [ ] Copiar credenciales de BD (host, port, username, password, database, URL)

#### Vercel
- [ ] Crear cuenta en Vercel
- [ ] Conectar cuenta de GitHub

#### GitHub
- [ ] Crear repositorio "deportur-web"
- [ ] Crear README.md básico
- [ ] Crear .gitignore para Java y React

### Día 4: Entorno Local
- [ ] Verificar Java 17+ instalado
- [ ] Verificar Maven instalado
- [ ] Instalar Node.js 18+
- [ ] Instalar VS Code (o IDE preferido)
- [ ] Instalar extensiones: ES7 React snippets, Tailwind IntelliSense, Spring Boot Tools
- [ ] Instalar MySQL Workbench o DBeaver
- [ ] Conectar a BD de Railway
- [ ] Ejecutar script CreateDB en Railway
- [ ] Verificar tablas y datos de prueba
- [ ] Crear carpeta local `deportur-web` con subcarpetas `backend` y `frontend`
- [ ] Crear documento privado con credenciales

---

## 🛠️ SEMANA 1-2: BACKEND (Días 5-19)

### Día 5: Crear Proyecto Spring Boot
- [ ] Ir a start.spring.io
- [ ] Configurar: Maven, Java 17, Spring Boot 3.2.x, Group: com.deportur, Artifact: backend
- [ ] Agregar dependencias: Web, JPA, MySQL, Security, OAuth2 Resource Server, Validation, Lombok
- [ ] Descargar y descomprimir en `deportur-backend`
- [ ] Abrir con IDE
- [ ] Ejecutar `mvn clean install` para verificar

### Día 6: Configuración Inicial
- [ ] Crear `application.properties`
- [ ] Crear `application-dev.properties`
- [ ] Configurar conexión a BD con variables de entorno
- [ ] Crear clase de configuración CORS
- [ ] Verificar que la app inicia sin errores
- [ ] Crear paquetes: model, repository, service, controller, dto, exception, config, security
- [ ] Configurar Git
- [ ] Primer commit: "Initial Spring Boot setup"
- [ ] Subir a GitHub

### Día 7-8: Migrar Modelos a JPA
- [ ] TipoEquipo (agregar @Entity, @Table, @Id, validaciones)
- [ ] DestinoTuristico
- [ ] Usuario
- [ ] Cliente
- [ ] EquipoDeportivo (con relaciones @ManyToOne)
- [ ] Reserva (con relaciones)
- [ ] DetalleReserva
- [ ] Crear enums: EstadoReserva, EstadoEquipo, TipoDocumento, Rol
- [ ] Commit después de cada entidad
- [ ] Verificar que la app arranca

### Día 9-10: Crear Repositories
- [ ] TipoEquipoRepository (extends JpaRepository)
- [ ] DestinoTuristicoRepository
- [ ] UsuarioRepository
- [ ] ClienteRepository (con findByDocumento)
- [ ] EquipoDeportivoRepository (con findByDisponibleTrue)
- [ ] ReservaRepository (con findByEstado)
- [ ] DetalleReservaRepository
- [ ] Commits frecuentes

### Día 11-13: Crear DTOs y Mappers
- [ ] ClienteDTO
- [ ] ReservaDTO
- [ ] EquipoDTO
- [ ] DestinoDTO
- [ ] TipoEquipoDTO
- [ ] UsuarioDTO
- [ ] CrearClienteRequest
- [ ] CrearReservaRequest
- [ ] ActualizarEquipoRequest
- [ ] Crear mappers (Entity ↔ DTO)
- [ ] Commits

### Día 14-15: Implementar Servicios
- [ ] UsuarioService (interfaz + implementación)
- [ ] ClienteService
- [ ] DestinoService
- [ ] TipoEquipoService
- [ ] EquipoService
- [ ] ReservaService
- [ ] Agregar validaciones de negocio
- [ ] Agregar manejo de excepciones
- [ ] Usar @Transactional donde sea necesario
- [ ] Commits por servicio

### Día 16-17: Crear Controllers REST
- [ ] ClienteController (GET, POST, PUT, DELETE)
- [ ] DestinoController
- [ ] TipoEquipoController
- [ ] EquipoController
- [ ] ReservaController
- [ ] UsuarioController (solo admin)
- [ ] Agregar @Valid para validaciones
- [ ] Retornar ResponseEntity con códigos HTTP correctos
- [ ] Probar cada endpoint con Postman
- [ ] Commits

### Día 18: Configurar Seguridad Auth0
- [ ] Agregar dependencia OAuth2 Resource Server
- [ ] Crear SecurityConfig
- [ ] Configurar validación de JWT de Auth0
- [ ] Configurar reglas de autorización (public, protected, admin)
- [ ] Crear filtro para extraer info del usuario del JWT
- [ ] Probar con token de Auth0

### Día 19: Testing Backend
- [ ] Probar todos los endpoints sin token (debe fallar)
- [ ] Probar todos los endpoints con token (debe funcionar)
- [ ] Probar endpoints de admin con token de trabajador (debe fallar)
- [ ] Verificar validaciones
- [ ] Probar casos límite (fechas inválidas, IDs inexistentes, campos vacíos)
- [ ] Documentar endpoints
- [ ] Commit final backend funcional

---

## 🎨 SEMANA 3-4: FRONTEND (Días 20-36)

### Día 20: Crear Proyecto React
- [ ] Crear proyecto con Vite + React
- [ ] Instalar dependencias: React Router, Auth0 React SDK, Axios, TanStack Query, Date-fns, React Hook Form, Lucide React
- [ ] Instalar y configurar Tailwind CSS
- [ ] Limpiar archivos de ejemplo
- [ ] Ejecutar proyecto para verificar
- [ ] Configurar Git
- [ ] Primer commit

### Día 21: Estructura y Configuración
- [ ] Crear carpetas: components, pages, services, hooks, context, utils, constants
- [ ] Configurar Auth0
- [ ] Configurar Axios
- [ ] Crear archivo de constantes
- [ ] Configurar .env.local con variables
- [ ] Agregar .env.local a .gitignore
- [ ] Crear .env.example
- [ ] Commit

### Día 22: Configurar Auth0
- [ ] Envolver app con Auth0Provider en main.jsx
- [ ] Crear hook useAuth
- [ ] Probar login con Google
- [ ] Verificar redirección
- [ ] Obtener info del usuario
- [ ] Commit

### Día 23: Componentes Base
- [ ] Layout principal
- [ ] Navbar/Header
- [ ] Sidebar
- [ ] Button (variantes: primary, secondary, danger)
- [ ] Card
- [ ] Modal
- [ ] Table
- [ ] Input
- [ ] Select
- [ ] LoadingSpinner
- [ ] Alert/Toast
- [ ] Aplicar estilos Tailwind según mockups
- [ ] Commit

### Día 24: Configurar Routing
- [ ] Crear páginas vacías: Login, Dashboard, Reservas, NuevaReserva, Clientes, Inventario, Destinos, Usuarios, NotFound
- [ ] Configurar React Router en App.jsx
- [ ] Crear rutas protegidas (requieren auth)
- [ ] Crear rutas admin (requieren rol)
- [ ] Probar navegación
- [ ] Commit

### Día 25-26: Servicios de API
- [ ] api.js (config base Axios con interceptores)
- [ ] authService.js
- [ ] clienteService.js (obtenerTodos, obtenerPorId, crear, actualizar, eliminar)
- [ ] reservaService.js
- [ ] equipoService.js
- [ ] destinoService.js
- [ ] usuarioService.js
- [ ] Configurar interceptor para JWT automático
- [ ] Configurar manejo de errores global
- [ ] Commits

### Día 27: Página de Login
- [ ] Diseñar según mockups
- [ ] Agregar logo DeporTur
- [ ] Botón "Continuar con Google"
- [ ] Llamar función Auth0
- [ ] Mostrar loading
- [ ] Manejar errores
- [ ] Redirigir a Dashboard
- [ ] Probar flujo completo
- [ ] Commit

### Día 28: Dashboard
- [ ] Crear layout
- [ ] Tarjetas con estadísticas (reservas activas, equipos disponibles, reservas hoy)
- [ ] Gráfico simple (opcional)
- [ ] Últimas reservas
- [ ] Conectar con API
- [ ] Loading states
- [ ] Commit

### Día 29-30: Gestión de Clientes
- [ ] Tabla de clientes
- [ ] Búsqueda/filtro
- [ ] Botón "Nuevo Cliente"
- [ ] Acciones: ver, editar, eliminar
- [ ] Conectar con API
- [ ] Paginación (si hay muchos)
- [ ] Modal con formulario (nombre, apellido, documento, tipo, teléfono, email)
- [ ] Validaciones
- [ ] Actualizar lista al crear/editar
- [ ] Commits

### Día 31-32: Gestión de Equipos
- [ ] Tabla de equipos (nombre, tipo, marca, estado, precio, destino, disponibilidad)
- [ ] Filtros (tipo, estado, destino)
- [ ] Botón "Nuevo Equipo"
- [ ] Acciones: ver, editar, eliminar
- [ ] Modal con formulario
- [ ] Dropdowns (tipo, destino desde API)
- [ ] Validaciones
- [ ] Conectar con API
- [ ] Commits

### Día 33-34: Gestión de Reservas
- [ ] Tabla de reservas (ID, cliente, destino, fechas, estado)
- [ ] Filtros (estado, fecha, destino)
- [ ] Badges de colores según estado
- [ ] Botón "Nueva Reserva"
- [ ] Acciones: ver detalle, cambiar estado, editar, cancelar
- [ ] Formulario paso a paso:
  - [ ] Paso 1: Seleccionar cliente
  - [ ] Paso 2: Seleccionar destino
  - [ ] Paso 3: Seleccionar fechas
  - [ ] Paso 4: Seleccionar equipos disponibles
  - [ ] Paso 5: Revisar y confirmar
- [ ] Mostrar resumen con precio
- [ ] Validar disponibilidad
- [ ] Conectar con API
- [ ] Commits frecuentes

### Día 35: Destinos y Tipos de Equipo
- [ ] Tabla de destinos
- [ ] CRUD básico destinos
- [ ] Formulario destinos (nombre, ubicación, descripción)
- [ ] Tabla de tipos de equipo
- [ ] CRUD básico tipos
- [ ] Formulario tipos (nombre, descripción)
- [ ] Commits

### Día 36: Gestión de Usuarios
- [ ] Verificar rol admin
- [ ] Tabla de usuarios (nombre, email, rol, estado)
- [ ] Formulario crear usuario
- [ ] Cambiar estado (activo/inactivo)
- [ ] NO permitir eliminar usuario actual
- [ ] Commit

---

## 🚀 SEMANA 5: DESPLIEGUE (Días 37-45)

### Día 37: Preparar Backend
- [ ] Revisar configuraciones
- [ ] Crear application-prod.properties
- [ ] Configurar variables de entorno
- [ ] Remover datos hardcoded
- [ ] Agregar health check endpoint
- [ ] Crear railway.json
- [ ] Commit final backend

### Día 38: Desplegar Backend en Railway
- [ ] Agregar servicio en Railway
- [ ] Conectar con GitHub
- [ ] Seleccionar carpeta backend
- [ ] Configurar variables de entorno (DB_URL, Auth0, JWT, FRONTEND_URL)
- [ ] Deploy
- [ ] Ver logs
- [ ] Probar health check
- [ ] Copiar URL backend

### Día 39: Actualizar Auth0
- [ ] Agregar URLs de producción en Auth0 (Callback, Logout, Web Origins)
- [ ] Guardar cambios

### Día 40: Preparar Frontend
- [ ] Actualizar variables de entorno (API_URL, Auth0)
- [ ] Crear vercel.json (si necesario)
- [ ] Probar build local: `npm run build`
- [ ] Verificar sin errores
- [ ] Commit

### Día 41: Desplegar Frontend en Vercel
- [ ] Importar proyecto desde GitHub en Vercel
- [ ] Seleccionar carpeta frontend
- [ ] Configurar variables de entorno (VITE_API_URL, VITE_AUTH0_*)
- [ ] Deploy
- [ ] Copiar URL frontend

### Día 42: Actualizar Backend
- [ ] Actualizar FRONTEND_URL en Railway con URL de Vercel
- [ ] Esperar redeploy

### Día 43: Testing Producción
- [ ] Abrir app en Vercel
- [ ] Probar login con Google
- [ ] Crear cliente
- [ ] Crear equipo
- [ ] Crear reserva completa
- [ ] Editar entidades
- [ ] Cambiar estados
- [ ] Filtros y búsquedas
- [ ] Navegación
- [ ] Probar en desktop, tablet, móvil
- [ ] Probar en Chrome, Firefox, Safari
- [ ] Anotar bugs
- [ ] Priorizar

### Día 44-45: Corrección de Bugs
- [ ] Corregir bugs críticos
- [ ] Mejorar UX
- [ ] Agregar loaders faltantes
- [ ] Mejorar mensajes de error
- [ ] Agregar confirmaciones para acciones destructivas
- [ ] Optimizar rendimiento (lazy loading, imágenes, requests)
- [ ] Animaciones sutiles (opcional)
- [ ] Commits y redeploys

---

## 📚 SEMANA 6: DOCUMENTACIÓN (Días 46-50)

### Día 46: Documentar Proyecto
- [ ] Actualizar README (descripción, tecnologías, screenshots, link producción, instrucciones locales, variables, autores)
- [ ] Crear CONTRIBUTING.md (si aplica)
- [ ] Crear documento de arquitectura

### Día 47: Documentar API
- [ ] Documentar endpoints (método, URL, headers, body, respuesta)
- [ ] Considerar Swagger/OpenAPI
- [ ] Crear Postman Collection

### Día 48: Video y Presentación
- [ ] Grabar video demo (login, navegación, reserva, inventario, admin)
- [ ] Preparar presentación (arquitectura, stack, diseño, retos, aprendizajes)

### Día 49: Testing Final
- [ ] Testing completo usuario final
- [ ] Pedir feedback de compañeros
- [ ] Hacer ajustes finales
- [ ] Verificar todo funciona

### Día 50: Entrega
- [ ] Verificar repositorio ordenado
- [ ] Verificar documentación completa
- [ ] Verificar app en producción funciona
- [ ] Crear release/tag en GitHub
- [ ] Preparar materiales (links repo, app, video, docs, credenciales)
- [ ] ¡Entregar y celebrar! 🎉

---

## 📊 RESUMEN

| Fase | Días | Tareas Principales |
|------|------|-------------------|
| Preparación | 1-4 | Mockups, cuentas, entorno local |
| Backend | 5-19 | Spring Boot, JPA, REST, Auth0 |
| Frontend | 20-36 | React, componentes, páginas, servicios |
| Despliegue | 37-45 | Railway, Vercel, testing producción |
| Docs | 46-50 | README, API docs, video, entrega |

**Total: 50 días (~7-8 semanas a 6-8 horas/día)**

---

## 🎯 TECNOLOGÍAS

**Backend:** Java 17, Spring Boot 3, JPA, Spring Security, OAuth2, MySQL, Maven  
**Frontend:** React 18, Vite, Router, Auth0, Axios, TanStack Query, Tailwind, Lucide  
**Servicios:** Auth0, Railway, Vercel, GitHub

---

## ⚠️ RECORDATORIOS

- ✅ Commits frecuentes con mensajes descriptivos
- ✅ Probar antes de avanzar
- ✅ No más de 2 horas en un bug (pedir ayuda)
- ✅ Documentar decisiones importantes
- ✅ Código limpio y comentado
- ✅ Desplegar temprano y frecuente

---

**Proyecto:** DeporTur - Sistema de Alquiler de Equipos Deportivos  
**Autores:** Juan Perea, Kevin Beltran  
**Fecha:** Octubre 2025