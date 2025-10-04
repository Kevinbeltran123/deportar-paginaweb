# DeporTur Frontend

Aplicación web React para el sistema de gestión de alquiler de equipos deportivos.

## 🚀 Tecnologías

- **React 18**
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **Auth0 React SDK** - Autenticación
- **Axios** - HTTP client
- **TanStack Query** - Gestión de estado servidor
- **React Hook Form** - Formularios
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Auth0
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos de producción se generan en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas/vistas de la aplicación
├── services/       # Servicios de API
├── hooks/          # Custom hooks
├── context/        # Context API
├── utils/          # Funciones utilitarias
├── constants/      # Constantes de la aplicación
├── App.jsx         # Componente principal
├── main.jsx        # Punto de entrada
└── index.css       # Estilos globales
```

## 🔐 Configuración de Auth0

1. Crear cuenta en [Auth0](https://auth0.com)
2. Crear aplicación (Single Page Application)
3. Configurar las URLs permitidas
4. Copiar credenciales a `.env.local`

Ver documentación completa en: [deportur-backend/CONFIGURACION-AUTH0.md](../deportur-backend/CONFIGURACION-AUTH0.md)

## 📚 Documentación

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Auth0 React SDK](https://auth0.com/docs/quickstart/spa/react)
- [TanStack Query](https://tanstack.com/query/latest)

## 👨‍💻 Desarrollo

Este proyecto está en desarrollo activo. Ver [checklist-deportur.md](../checklist-deportur.md) para el estado actual.

---

**Autores:** Juan Perea, Kevin Beltran, Carlos Rincon
