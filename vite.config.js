// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 💡 Usa '0.0.0.0' para escuchar en todas las interfaces de red
    host: '0.0.0.0', 
    // Asegúrate de que el puerto sea el que estás usando
    port: 5173, 
    hmr: {
        // A veces especificar el cliente ayuda
        clientPort: 5173, 
        // Si usas HTTPS/SSL, esto debe ser true
        protocol: 'ws', 
    },
  },
});