import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables desde el .env en la raíz del proyecto
  const env = loadEnv(mode, process.cwd() + '/..', '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true
    },
    // Exponer solo las variables VITE_* al cliente
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(env.VITE_AUTH0_DOMAIN),
      'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(env.VITE_AUTH0_CLIENT_ID),
      'import.meta.env.VITE_AUTH0_AUDIENCE': JSON.stringify(env.VITE_AUTH0_AUDIENCE),
      'import.meta.env.VITE_AUTH0_REDIRECT_URI': JSON.stringify(env.VITE_AUTH0_REDIRECT_URI),
    }
  }
})
