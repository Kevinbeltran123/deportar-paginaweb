# 📋 Plan de Acción Paso a Paso - Migración DeporTur a Web

**Proyecto:** Sistema de Alquiler de Equipos Deportivos en Destinos Turísticos  
**Autores:** Juan Perea, Kevin Beltran, Carlos Rincon  
**Objetivo:** Migrar aplicación Java Desktop a aplicación Web moderna  

---

## 🎯 SEMANA 0: PREPARACIÓN Y CONFIGURACIÓN (3-4 días)

### **Día 1: Diseño y Planeación**

#### Mañana:
1. Crear cuenta gratuita en Figma (figma.com)
2. Explorar plantillas de dashboards administrativos en Figma Community
3. Buscar inspiración: "admin dashboard", "booking system", "rental management"
4. Seleccionar una paleta de colores (tema deportes/turismo)
   - Color primario (azul/verde)
   - Color secundario
   - Colores de estado (success, warning, error)

#### Tarde:
5. Crear wireframes de baja fidelidad para:
   - Pantalla de login (solo botón de Google)
   - Dashboard principal (resumen de estadísticas)
   - Lista de reservas con filtros
   - Formulario de nueva reserva
   - Lista de inventario/equipos
   - Lista de clientes
   - Lista de destinos turísticos
   - Panel de usuarios (solo para admin)

6. Definir flujos de navegación:
   - ¿Qué ve un usuario al entrar?
   - ¿Cómo se crea una reserva paso a paso?
   - ¿Cómo se edita un equipo?

### **Día 2: Completar Mockups**

#### Todo el día:
7. Convertir wireframes a diseños de alta fidelidad
8. Crear componentes reutilizables:
   - Botones (primario, secundario, peligro)
   - Tarjetas
   - Formularios
   - Tablas
   - Modales
9. Diseñar versión móvil de las pantallas principales
10. Crear prototipo interactivo (conectar pantallas en Figma)
11. Probar el flujo con 2-3 personas para feedback
12. Hacer ajustes según retroalimentación

### **Día 3: Configuración de Cuentas y Servicios**

#### Mañana - Auth0:
1. Crear cuenta en Auth0 (auth0.com)
2. Crear nueva aplicación:
   - Tipo: Single Page Application
   - Nombre: "DeporTur Frontend"
3. En la aplicación creada, ir a Settings y copiar:
   - Domain
   - Client ID
4. Configurar URLs en Auth0 Settings:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
5. Ir a Authentication → Social → Habilitar Google
6. Crear API en Auth0:
   - Name: "DeporTur API"
   - Identifier: `https://deportur-api.com`
7. En la API creada, ir a Permissions y agregar:
   - `read:reservas`
   - `write:reservas`
   - `read:clientes`
   - `write:clientes`
   - `read:equipos`
   - `write:equipos`
   - `admin:all`
8. Guardar todos los valores (Domain, Client ID, API Identifier) en un documento seguro

#### Tarde - Railway (Backend y Base de Datos):
9. Crear cuenta en Railway (railway.app)
10. Crear nuevo proyecto: "DeporTur Backend"
11. Dentro del proyecto, agregar servicio MySQL
12. Copiar las credenciales de la base de datos:
    - Host
    - Port
    - Username
    - Password
    - Database name
    - URL de conexión completa
13. No hacer nada más por ahora (desplegaremos después)

#### Tarde - Vercel (Frontend):
14. Crear cuenta en Vercel (vercel.com)
15. Conectar tu cuenta de GitHub
16. No crear proyecto todavía (lo haremos cuando tengamos código)

#### Noche - GitHub:
17. Crear repositorio en GitHub: "deportur-web"
18. NO subir el código viejo de Java todavía
19. Crear archivo README.md básico explicando el proyecto
20. Crear .gitignore para Java y React

### **Día 4: Configuración de Entorno Local**

#### Mañana - Instalaciones necesarias:
1. Verificar que tienes instalado Java 17 o superior
2. Verificar que tienes Maven instalado
3. Instalar Node.js (versión 18 o superior)
4. Instalar Visual Studio Code o tu IDE preferido
5. Instalar extensiones recomendadas:
   - Para VSCode: ES7+ React snippets, Tailwind CSS IntelliSense, Spring Boot Tools

#### Tarde - Conectar a Base de Datos Railway:
6. Descargar MySQL Workbench o DBeaver
7. Conectarte a la base de datos de Railway usando las credenciales
8. Ejecutar tu script CreateDB en la base de datos de Railway
9. Verificar que todas las tablas se crearon correctamente
10. Verificar que los datos de prueba están ahí

#### Noche - Organizar archivos:
11. Crear carpeta local: `deportur-web`
12. Dentro crear dos subcarpetas:
    - `deportur-backend`
    - `deportur-frontend`
13. Crear documento con todas las credenciales y configuraciones (NO subirlo a Git)

---

## 🛠️ SEMANA 1-2: DESARROLLO DEL BACKEND (10-12 días)

### **Día 5: Crear Proyecto Spring Boot**

1. Ir a start.spring.io
2. Configurar proyecto:
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.x (última estable)
   - Group: com.deportur
   - Artifact: backend
   - Java: 17
3. Agregar dependencias:
   - Spring Web
   - Spring Data JPA
   - MySQL Driver
   - Spring Security
   - OAuth2 Resource Server
   - Validation
   - Lombok
4. Generar y descargar proyecto
5. Descomprimir en la carpeta `deportur-backend`
6. Abrir con tu IDE
7. Verificar que el proyecto compila: ejecutar `mvn clean install`

### **Día 6: Configuración Inicial del Backend**

#### Mañana:
1. Crear archivo `application.properties` con configuración básica
2. Crear archivo `application-dev.properties` para desarrollo local
3. Configurar conexión a base de datos con variables de entorno
4. Crear clase de configuración CORS
5. Intentar ejecutar la aplicación y verificar que inicia sin errores

#### Tarde:
6. Crear paquetes básicos:
   - model
   - repository
   - service
   - controller
   - dto
   - exception
   - config
   - security
7. Configurar Git en el proyecto backend
8. Hacer primer commit: "Initial Spring Boot setup"
9. Subir a GitHub

### **Día 7-8: Migrar Modelos a Entidades JPA**

#### Para cada entidad (Cliente, Reserva, Equipo, etc.):
1. Copiar la clase Java antigua
2. Agregar anotaciones JPA (@Entity, @Table, @Id, etc.)
3. Agregar relaciones (@ManyToOne, @OneToMany, etc.)
4. Crear enums para estados (EstadoReserva, EstadoEquipo, TipoDocumento, Rol)
5. Agregar validaciones (@NotNull, @Size, etc.)

#### Orden sugerido:
- TipoEquipo (más simple)
- DestinoTuristico (más simple)
- Usuario (para autenticación)
- Cliente
- EquipoDeportivo (depende de TipoEquipo y Destino)
- Reserva (depende de Cliente y Destino)
- DetalleReserva (depende de Reserva y Equipo)

6. Hacer commit después de cada entidad
7. Probar que la aplicación sigue arrancando

### **Día 9-10: Crear Repositories**

1. Para cada entidad, crear su Repository interface
2. Extender JpaRepository
3. Agregar métodos de búsqueda personalizados si son necesarios
4. Ejemplos:
   - `findByDocumento` en ClienteRepository
   - `findByDisponibleTrue` en EquipoRepository
   - `findByEstado` en ReservaRepository
5. Hacer commits frecuentes

### **Día 11-13: Crear DTOs**

#### ¿Qué son los DTOs?
- Objetos para transferir datos entre frontend y backend
- No expones las entidades directamente

#### Crear DTOs para:
1. Respuestas (Response DTOs):
   - ClienteDTO
   - ReservaDTO
   - EquipoDTO
   - etc.
2. Peticiones (Request DTOs):
   - CrearClienteRequest
   - CrearReservaRequest
   - ActualizarEquipoRequest
   - etc.
3. Crear mappers (clases o métodos para convertir Entity ↔ DTO)
4. Hacer commits

### **Día 14-15: Implementar Servicios**

#### Para cada entidad, crear su Service:
1. Crear interfaz del servicio
2. Crear implementación
3. Inyectar el repository correspondiente
4. Implementar lógica de negocio:
   - Validaciones (fechas, disponibilidad, etc.)
   - Cálculos (precios, duraciones, etc.)
   - Reglas del negocio
5. Agregar manejo de excepciones personalizadas
6. Usar transacciones donde sea necesario
7. Hacer commits por cada servicio completado

#### Servicios a implementar:
- UsuarioService
- ClienteService
- DestinoService
- TipoEquipoService
- EquipoService
- ReservaService

### **Día 16-17: Crear Controllers REST**

#### Para cada recurso, crear su Controller:
1. Anotar con @RestController y @RequestMapping
2. Inyectar el servicio correspondiente
3. Implementar endpoints:
   - GET /api/clientes (listar todos)
   - GET /api/clientes/{id} (obtener uno)
   - POST /api/clientes (crear)
   - PUT /api/clientes/{id} (actualizar)
   - DELETE /api/clientes/{id} (eliminar)
4. Agregar validaciones con @Valid
5. Retornar ResponseEntity con códigos HTTP apropiados
6. Probar cada endpoint con Postman o Thunder Client
7. Hacer commits

#### Controllers a crear:
- ClienteController
- DestinoController
- TipoEquipoController
- EquipoController
- ReservaController
- UsuarioController (solo para admin)

### **Día 18: Configurar Seguridad con Auth0**

1. Agregar dependencias de OAuth2 Resource Server
2. Crear clase SecurityConfig
3. Configurar para validar JWT de Auth0
4. Configurar reglas de autorización:
   - Endpoints públicos (ninguno excepto health check)
   - Endpoints protegidos (todos)
   - Endpoints solo para admin (/api/usuarios)
5. Crear filtro para extraer información del usuario del JWT
6. Probar autenticación con token de prueba de Auth0

### **Día 19: Testing del Backend**

1. Probar TODOS los endpoints con Postman:
   - Sin token (debe fallar)
   - Con token de Auth0 (debe funcionar)
   - Con token de admin vs trabajador
2. Verificar que las validaciones funcionan
3. Probar casos límite:
   - Fechas inválidas
   - IDs que no existen
   - Campos requeridos vacíos
4. Documentar endpoints en un documento
5. Hacer commit final del backend funcional

---

## 🎨 SEMANA 3-4: DESARROLLO DEL FRONTEND (10-12 días)

### **Día 20: Crear Proyecto React**

1. Abrir terminal en la carpeta `deportur-frontend`
2. Ejecutar comando para crear proyecto Vite con React
3. Entrar a la carpeta del proyecto
4. Instalar dependencias adicionales:
   - React Router DOM (navegación)
   - Auth0 React SDK (autenticación)
   - Axios (peticiones HTTP)
   - TanStack Query (manejo de estado servidor)
   - Date-fns (manejo de fechas)
   - React Hook Form (formularios)
   - Lucide React (iconos)
5. Instalar Tailwind CSS
6. Configurar Tailwind
7. Limpiar archivos de ejemplo
8. Ejecutar proyecto para verificar que funciona
9. Configurar Git y hacer primer commit

### **Día 21: Estructura de Carpetas y Configuración**

1. Crear estructura de carpetas dentro de `src`:
   - components/
   - pages/
   - services/
   - hooks/
   - context/
   - utils/
   - constants/
2. Crear archivo de configuración de Auth0
3. Crear archivo de configuración de Axios
4. Crear archivo con constantes (URLs, estados, etc.)
5. Configurar variables de entorno (.env.local)
6. Agregar .env.local al .gitignore
7. Crear archivo .env.example como template
8. Hacer commit

### **Día 22: Configurar Auth0 en React**

1. Envolver aplicación con Auth0Provider en main.jsx
2. Configurar con tus credenciales de Auth0
3. Crear hook personalizado useAuth
4. Crear contexto de autenticación si es necesario
5. Probar que Auth0 funciona:
   - Botón de login
   - Redirección a Auth0
   - Login con Google
   - Redirección de vuelta
   - Obtener información del usuario
6. Hacer commit

### **Día 23: Crear Componentes Base**

#### Componentes de Layout:
1. Layout principal (con sidebar y header)
2. Navbar/Header (con nombre de usuario y logout)
3. Sidebar (menú de navegación)
4. Footer (opcional)

#### Componentes Comunes:
5. Button (con variantes: primary, secondary, danger)
6. Card
7. Modal
8. Table
9. Input
10. Select
11. LoadingSpinner
12. Alert/Toast para notificaciones

13. Aplicar estilos de Tailwind según mockups
14. Hacer commit: "Base components created"

### **Día 24: Configurar Routing**

1. Crear todas las páginas vacías en carpeta pages/:
   - Login.jsx
   - Dashboard.jsx
   - Reservas.jsx
   - NuevaReserva.jsx
   - Clientes.jsx
   - Inventario.jsx
   - Destinos.jsx
   - Usuarios.jsx (solo admin)
   - NotFound.jsx
2. Configurar React Router en App.jsx
3. Crear rutas protegidas (requieren autenticación)
4. Crear rutas de admin (requieren rol admin)
5. Probar navegación entre páginas
6. Hacer commit

### **Día 25-26: Crear Servicios de API**

#### Por cada recurso, crear su servicio:
1. api.js (configuración base de Axios con interceptores)
2. authService.js (funciones relacionadas con Auth0)
3. clienteService.js
4. reservaService.js
5. equipoService.js
6. destinoService.js
7. usuarioService.js

#### En cada servicio incluir:
- obtenerTodos()
- obtenerPorId(id)
- crear(datos)
- actualizar(id, datos)
- eliminar(id)
- Métodos específicos si son necesarios

8. Configurar interceptor para agregar token JWT automáticamente
9. Configurar manejo de errores global
10. Hacer commits

### **Día 27: Página de Login**

1. Diseñar página siguiendo mockups
2. Agregar logo de DeporTur
3. Botón "Continuar con Google"
4. Al hacer click, llamar función de Auth0
5. Mostrar loading mientras autentica
6. Si hay error, mostrar mensaje
7. Si es exitoso, redirigir a Dashboard
8. Probar flujo completo
9. Hacer commit

### **Día 28: Dashboard Principal**

1. Crear layout del dashboard
2. Agregar tarjetas con estadísticas:
   - Total de reservas activas
   - Equipos disponibles
   - Reservas hoy
   - Ingresos del mes (opcional)
3. Agregar gráfico simple (opcional)
4. Mostrar últimas reservas
5. Conectar con API para obtener datos reales
6. Agregar loading states
7. Probar y hacer commit

### **Día 29-30: Gestión de Clientes**

#### Lista de Clientes:
1. Crear tabla con todos los clientes
2. Agregar búsqueda/filtro
3. Agregar botón "Nuevo Cliente"
4. Agregar acciones: ver, editar, eliminar
5. Conectar con API
6. Agregar paginación si hay muchos registros

#### Formulario de Cliente:
7. Crear modal con formulario
8. Campos: nombre, apellido, documento, tipo documento, teléfono, email
9. Validaciones
10. Conectar con API para crear
11. Actualizar lista al crear/editar
12. Hacer commits

### **Día 31-32: Gestión de Equipos/Inventario**

#### Lista de Equipos:
1. Crear tabla de equipos
2. Mostrar: nombre, tipo, marca, estado, precio, destino, disponibilidad
3. Filtros por: tipo, estado, destino
4. Botón "Nuevo Equipo"
5. Acciones: ver, editar, eliminar

#### Formulario de Equipo:
6. Crear modal con formulario
7. Campos según tu modelo
8. Dropdown para tipo de equipo (cargar desde API)
9. Dropdown para destino (cargar desde API)
10. Validaciones
11. Conectar con API
12. Hacer commits

### **Día 33-34: Gestión de Reservas**

#### Lista de Reservas:
1. Crear tabla de reservas
2. Mostrar: ID, cliente, destino, fecha inicio, fecha fin, estado
3. Filtros por: estado, fecha, destino
4. Badges de colores según estado
5. Botón "Nueva Reserva"
6. Acciones: ver detalle, cambiar estado, editar, cancelar

#### Formulario de Nueva Reserva (complejo):
7. Paso 1: Seleccionar cliente (o crear nuevo)
8. Paso 2: Seleccionar destino
9. Paso 3: Seleccionar fechas
10. Paso 4: Seleccionar equipos disponibles para esas fechas
11. Paso 5: Revisar y confirmar
12. Mostrar resumen con precio total
13. Validar disponibilidad
14. Conectar con API
15. Hacer commits frecuentes

### **Día 35: Gestión de Destinos y Tipos de Equipo**

#### Destinos:
1. Tabla simple con destinos
2. CRUD básico
3. Formulario con: nombre, ubicación, descripción

#### Tipos de Equipo:
4. Tabla simple con tipos
5. CRUD básico
6. Formulario con: nombre, descripción

7. Hacer commits

### **Día 36: Gestión de Usuarios (Solo Admin)**

1. Verificar rol de admin antes de mostrar
2. Tabla de usuarios del sistema
3. Mostrar: nombre, email, rol, estado
4. Formulario para crear usuario
5. Cambiar estado (activo/inactivo)
6. NO permitir eliminar usuario actual
7. Hacer commit

---

## 🚀 SEMANA 5: DESPLIEGUE Y REFINAMIENTO (5-7 días)

### **Día 37: Preparar Backend para Producción**

1. Revisar todas las configuraciones
2. Crear perfil de producción (application-prod.properties)
3. Configurar para usar variables de entorno
4. Remover cualquier dato hardcoded
5. Agregar health check endpoint
6. Crear archivo railway.json en raíz del proyecto
7. Hacer commit final del backend

### **Día 38: Desplegar Backend en Railway**

1. Desde Railway, agregar nuevo servicio
2. Conectar con tu repositorio de GitHub
3. Seleccionar carpeta del backend
4. Railway detectará que es Maven/Spring Boot
5. Configurar variables de entorno en Railway:
   - URL de base de datos (Railway la genera)
   - Auth0 domain
   - Auth0 audience
   - JWT secret
   - URL del frontend (agregarla después)
6. Hacer deploy
7. Esperar a que termine (ver logs)
8. Probar endpoint de health check
9. Copiar URL del backend deployado

### **Día 39: Actualizar Configuración de Auth0**

1. Ir a tu aplicación en Auth0
2. Agregar URLs de producción:
   - Callback: tu-app.vercel.app
   - Logout: tu-app.vercel.app
   - Web Origins: tu-app.vercel.app
3. Guardar cambios

### **Día 40: Preparar Frontend para Producción**

1. Actualizar variables de entorno:
   - URL del backend (Railway)
   - Auth0 credentials
2. Crear archivo vercel.json si es necesario
3. Probar build local: `npm run build`
4. Verificar que no hay errores
5. Hacer commit

### **Día 41: Desplegar Frontend en Vercel**

1. Desde Vercel, importar proyecto desde GitHub
2. Seleccionar carpeta del frontend
3. Vercel detectará que es Vite/React
4. Configurar variables de entorno en Vercel:
   - VITE_API_URL (Railway backend)
   - VITE_AUTH0_DOMAIN
   - VITE_AUTH0_CLIENT_ID
   - VITE_AUTH0_AUDIENCE
5. Hacer deploy
6. Esperar a que termine
7. Copiar URL del frontend

### **Día 42: Actualizar Backend con URL del Frontend**

1. Ir a Railway
2. Actualizar variable FRONTEND_URL con la URL de Vercel
3. Redeploy automático
4. Esperar

### **Día 43: Testing en Producción**

1. Abrir tu aplicación en la URL de Vercel
2. Probar login con Google
3. Probar TODAS las funcionalidades:
   - Crear cliente
   - Crear equipo
   - Crear reserva completa
   - Editar cada entidad
   - Cambiar estados de reservas
   - Filtros y búsquedas
   - Navegación entre páginas
4. Probar en diferentes dispositivos:
   - Desktop
   - Tablet
   - Móvil
5. Probar en diferentes navegadores:
   - Chrome
   - Firefox
   - Safari (si es posible)
6. Anotar todos los bugs encontrados
7. Priorizar y empezar a corregir

### **Día 44-45: Corrección de Bugs y Refinamiento**

1. Corregir bugs críticos primero
2. Mejorar UX donde sea necesario
3. Agregar loaders donde falten
4. Mejorar mensajes de error
5. Agregar confirmaciones para acciones destructivas
6. Optimizar rendimiento:
   - Lazy loading de rutas
   - Optimizar imágenes
   - Minimizar requests innecesarios
7. Agregar animaciones sutiles (opcional)
8. Hacer commits y redeploys según correcciones

---

## 📚 SEMANA 6: DOCUMENTACIÓN Y TOQUES FINALES (3-5 días)

### **Día 46: Documentación del Proyecto**

1. Actualizar README del repositorio con:
   - Descripción del proyecto
   - Tecnologías utilizadas
   - Capturas de pantalla
   - Link al sitio en producción
   - Instrucciones para ejecutar localmente
   - Variables de entorno necesarias
   - Autores y contacto
2. Crear archivo CONTRIBUTING.md si es proyecto colaborativo
3. Crear archivo de arquitectura explicando decisiones técnicas

### **Día 47: Documentación de la API**

1. Documentar todos los endpoints:
   - Método HTTP
   - URL
   - Headers necesarios
   - Body de ejemplo
   - Respuesta de ejemplo
2. Considerar usar Swagger/OpenAPI (opcional)
3. Crear un Postman Collection exportable

### **Día 48: Video Demo y Presentación**

1. Grabar video demostrando:
   - Login con Google
   - Navegación general
   - Crear una reserva completa
   - Gestión de inventario
   - Funcionalidades de admin
2. Preparar presentación explicando:
   - Arquitectura del sistema
   - Stack tecnológico elegido
   - Decisiones de diseño
   - Retos enfrentados
   - Aprendizajes

### **Día 49: Testing Final**

1. Hacer testing completo de usuario final
2. Pedir a amigos/compañeros que prueben
3. Recopilar feedback
4. Hacer ajustes finales
5. Verificar que todo funciona perfectamente

### **Día 50: Entrega**

1. Verificar que el repositorio está ordenado
2. Verificar que la documentación está completa
3. Verificar que la app en producción funciona
4. Crear release/tag en GitHub
5. Preparar materiales de entrega:
   - Link al repositorio
   - Link a la aplicación
   - Link al video demo
   - Documento de arquitectura
   - Credenciales de prueba (si aplica)
6. ¡Entregar y celebrar! 🎉

---

## 📊 RESUMEN DE TIEMPO

| Fase | Duración | Días |
|------|----------|------|
| Preparación y Mockups | 4 días | 1-4 |
| Backend Spring Boot | 15 días | 5-19 |
| Frontend React | 17 días | 20-36 |
| Despliegue | 9 días | 37-45 |
| Documentación | 5 días | 46-50 |
| **TOTAL** | **~50 días** | **7-8 semanas** |

*Trabajando 6-8 horas diarias*

---

## ⚠️ CONSEJOS IMPORTANTES

### Hacer commits frecuentes:
- Después de cada funcionalidad completada
- Con mensajes descriptivos
- Usar branches para features grandes

### Probar constantemente:
- No avanzar sin probar lo anterior
- Usar Postman para backend
- Probar en navegador para frontend

### Pedir ayuda cuando te atores:
- No perder más de 2 horas en un bug
- Buscar en Stack Overflow
- Preguntar en Discord/foros

### Mantener organización:
- Llevar checklist de tareas completadas
- Documentar decisiones importantes
- Mantener código limpio y comentado

### Desplegar temprano:
- Railway y Vercel permiten despliegues ilimitados
- Cada deploy es práctica
- Encontrarás bugs antes

---

## 🎯 TECNOLOGÍAS UTILIZADAS

### Backend:
- Java 17
- Spring Boot 3.2.x
- Spring Data JPA
- Spring Security + OAuth2
- MySQL 8
- Maven

### Frontend:
- React 18
- Vite
- React Router DOM
- Auth0 React SDK
- Axios
- TanStack Query
- Tailwind CSS
- Lucide React

### Servicios:
- Auth0 (Autenticación)
- Railway (Backend + Base de Datos)
- Vercel (Frontend)
- GitHub (Control de versiones)

---

**Documento creado:** Octubre 2025  
**Proyecto:** DeporTur - Sistema de Alquiler de Equipos Deportivos  
**Contacto:** juan.perea@estudiantesunibague.edu.co, kevin.beltran@estudiantesunibague.edu.co, carlos.rincon@estudiantesunibague.edu.co