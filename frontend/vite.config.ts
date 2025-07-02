import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/users': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/authors': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/books': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/manuscripts': {
        target: 'http://localhost:8087',
        changeOrigin: true,
      },
      '/points': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/subscriptions': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
