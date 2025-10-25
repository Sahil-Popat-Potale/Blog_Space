import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react';

export default defineConfig({ 
    plugins:[react()], 
    server:{ port:5173 },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/scss/_variables.scss";`
        }
      }
    }
});
