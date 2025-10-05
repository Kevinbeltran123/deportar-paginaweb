# 🧪 Guía de Pruebas - DeporTur

Esta guía te muestra cómo verificar que todo el sistema está funcionando correctamente.

## ✅ Verificación Rápida

### 1. Estado de los Servicios

```bash
# Verificar Backend (debe responder 401 - requiere autenticación)
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8080/api/destinos

# Verificar Frontend (debe responder 200)
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:5173
```

**Resultado esperado:**
```
Backend: 401
Frontend: 200
```

✅ **401 en el backend es CORRECTO** - significa que requiere autenticación JWT
✅ **200 en el frontend es CORRECTO** - la aplicación está sirviendo

---

## 🎯 Prueba Interactiva (Recomendado)

### Opción 1: Página de Prueba Integrada

**La forma más fácil de probar todo:**

1. Abre el navegador en: **http://localhost:5173/prueba**

2. Verás una interfaz de prueba con:
   - ✅ Estado de autenticación
   - ✅ Botones para probar cada endpoint
   - ✅ Visualización de respuestas JSON
   - ✅ Diagnóstico de errores

3. **Flujo de prueba:**
   ```
   Paso 1: Haz clic en "Iniciar Sesión"
   Paso 2: Autentícate con Auth0
   Paso 3: Prueba los endpoints (Clientes, Destinos, Equipos, etc.)
   Paso 4: Observa las respuestas
   ```

**Qué verifica esta prueba:**
- ✅ Autenticación Auth0
- ✅ Token JWT se obtiene correctamente
- ✅ Token se agrega automáticamente a las peticiones
- ✅ Backend responde correctamente
- ✅ CORS configurado correctamente
- ✅ Base de datos Supabase conectada

---

## 📋 Pruebas Paso a Paso

### Prueba 1: Verificar Servicios Corriendo

```bash
# Backend debe estar en puerto 8080
lsof -ti:8080

# Frontend debe estar en puerto 5173
lsof -ti:5173
```

Si alguno no está corriendo:

```bash
# Arrancar Backend
cd deportur-backend
./run.sh

# Arrancar Frontend (en otra terminal)
cd deportur-frontend
npm run dev
```

---

### Prueba 2: Verificar Conectividad Backend

```bash
# Probar todos los endpoints (sin autenticación - deben dar 401)
curl -s -o /dev/null -w "Clientes: %{http_code}\n" http://localhost:8080/api/clientes
curl -s -o /dev/null -w "Destinos: %{http_code}\n" http://localhost:8080/api/destinos
curl -s -o /dev/null -w "Equipos: %{http_code}\n" http://localhost:8080/api/equipos
curl -s -o /dev/null -w "Reservas: %{http_code}\n" http://localhost:8080/api/reservas
curl -s -o /dev/null -w "Tipos: %{http_code}\n" http://localhost:8080/api/tipos-equipo
```

**Resultado esperado (todos 401):**
```
Clientes: 401
Destinos: 401
Equipos: 401
Reservas: 401
Tipos: 401
```

---

### Prueba 3: Verificar Autenticación Auth0

1. Abre el navegador en: http://localhost:5173/prueba

2. **Verifica el estado de autenticación:**
   - Debe mostrar "⚠️ No autenticado" inicialmente
   - Botón "Iniciar Sesión" debe estar visible

3. **Haz clic en "Iniciar Sesión":**
   - Te redirige a Auth0
   - Ingresa tus credenciales
   - Te redirige de vuelta

4. **Después de autenticarte:**
   - Debe mostrar "✅ Autenticado"
   - Debe mostrar tu nombre/email
   - Botones de endpoints deben estar habilitados

---

### Prueba 4: Probar Endpoints con Autenticación

**Una vez autenticado en http://localhost:5173/prueba:**

1. **Haz clic en "📋 Listar Clientes"**
   - Debe mostrar "✅ Respuesta Exitosa"
   - Debe mostrar JSON con los clientes
   - Debe mostrar "Registros obtenidos: X"

2. **Haz clic en "🏖️ Listar Destinos"**
   - Igual que clientes, debe mostrar datos

3. **Prueba todos los demás endpoints**

**Si hay errores:**
- ❌ 401: Token expirado → Cierra sesión e inicia sesión nuevamente
- ❌ 403: Sin permisos → Verifica roles en Auth0
- ❌ 404: Endpoint no encontrado → Verifica que backend esté corriendo
- ❌ 500: Error servidor → Revisa logs del backend
- ❌ Network error: Error de conexión → Verifica CORS y que backend esté en puerto 8080

---

### Prueba 5: Verificar Token JWT (Navegador)

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Prueba un endpoint desde la página de prueba
4. Haz clic en la petición en Network
5. Ve a "Headers"
6. **Verifica:**
   ```
   Request Headers:
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

✅ Si ves el header `Authorization` con `Bearer [token]`, el token se está agregando automáticamente

---

### Prueba 6: Componentes de Ejemplo

**Prueba los componentes React creados:**

1. **ListaClientes** - Ver lista de clientes
   ```bash
   # Importar en Dashboard.jsx
   import { ListaClientes } from '../components/clientes/ListaClientes';

   # Usar en el render
   <ListaClientes />
   ```

2. **FormularioCliente** - Crear/Editar cliente
   ```bash
   import { FormularioCliente } from '../components/clientes/FormularioCliente';

   <FormularioCliente
     onSuccess={() => console.log('Cliente guardado')}
   />
   ```

3. **ListaClientesReactQuery** - Versión optimizada con React Query
   ```bash
   import { ListaClientesReactQuery } from '../components/clientes/ListaClientesReactQuery';

   <ListaClientesReactQuery />
   ```

---

### Prueba 7: Probar con cURL y Token Real

**Para pruebas avanzadas con token JWT:**

1. Obtén el token desde el navegador:
   ```javascript
   // En la consola del navegador (F12)
   const cacheKey = Object.keys(localStorage)
     .find(key => key.includes('@@auth0spajs@@'));
   const data = JSON.parse(localStorage.getItem(cacheKey));
   console.log('Token:', data.body.access_token);
   ```

2. Copia el token y prueba con cURL:
   ```bash
   TOKEN="tu_token_aqui"

   curl -H "Authorization: Bearer $TOKEN" \
        http://localhost:8080/api/clientes
   ```

   **Resultado esperado:** JSON con lista de clientes

---

## 🐛 Solución de Problemas

### Error: "CORS blocked"
```bash
# Verifica configuración CORS en SecurityConfig.java
# Debe permitir: http://localhost:5173
```

### Error: "401 Unauthorized"
```bash
# Opción 1: Token expirado
# - Cierra sesión e inicia sesión nuevamente

# Opción 2: Token no se está enviando
# - Verifica en Network > Headers que exista "Authorization: Bearer ..."
# - Verifica que App.jsx tiene: setTokenGetter(getAccessTokenSilently)
```

### Error: "Network Error"
```bash
# Verifica que backend esté corriendo
lsof -ti:8080

# Si no está corriendo
cd deportur-backend
./run.sh
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd deportur-frontend
npm install
```

### Backend no conecta a Supabase
```bash
# Verifica credenciales en .env raíz
cat .env | grep SUPABASE

# Verifica que run.sh carga el .env
cd deportur-backend
./run.sh
# Debe mostrar: "📄 Cargando credenciales desde .env..."
```

---

## ✅ Checklist de Verificación Final

Marca cada item cuando funcione:

**Backend:**
- [ ] Backend corriendo en puerto 8080
- [ ] Endpoints responden 401 (sin token)
- [ ] Conectado a Supabase PostgreSQL
- [ ] Auth0 configurado correctamente
- [ ] CORS permite localhost:5173

**Frontend:**
- [ ] Frontend corriendo en puerto 5173
- [ ] Página de prueba carga (/prueba)
- [ ] Login con Auth0 funciona
- [ ] Token JWT se obtiene tras login
- [ ] Token se agrega automáticamente a peticiones

**Integración:**
- [ ] Peticiones con token reciben respuesta 200
- [ ] JSON se visualiza correctamente
- [ ] Errores se manejan apropiadamente
- [ ] Componentes de ejemplo funcionan
- [ ] CRUD completo funciona (Create, Read, Update, Delete)

---

## 🚀 Acceso Rápido

**URLs Principales:**
- Frontend: http://localhost:5173
- Página de Prueba: http://localhost:5173/prueba
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html

**Archivos Clave:**
- Configuración API: `deportur-frontend/src/services/api.js`
- Servicios: `deportur-frontend/src/services/`
- Hook Auth: `deportur-frontend/src/hooks/useAuth.js`
- Componentes Ejemplo: `deportur-frontend/src/components/clientes/`
- Guía de Uso: `deportur-frontend/GUIA-CONSUMO-APIS.md`

---

## 📊 Estado Esperado

```
✅ Backend: Running on :8080
✅ Frontend: Running on :5173
✅ Auth0: Configured
✅ JWT: Auto-attached
✅ Database: Connected (Supabase)
✅ CORS: Enabled for localhost:5173
✅ Services: All 5 entity services created
✅ Components: Example components ready
```

**Todo está funcionando correctamente si:**
1. Puedes iniciar sesión con Auth0
2. Los endpoints devuelven datos (no 401)
3. Ves respuestas JSON en la página de prueba
4. Los componentes de ejemplo funcionan

---

¡Listo! Ahora puedes verificar que todo el sistema está funcionando correctamente. 🎉
