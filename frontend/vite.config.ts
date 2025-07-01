import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 루트 디렉토리와 frontend 디렉토리의 .env 파일을 모두 로드
  const env = loadEnv(mode, path.resolve(__dirname, '../'), '');
  const frontendEnv = loadEnv(mode, __dirname, '');
  
  return {
    server: {
      host: "::",
      port: 3000,
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
    define: {
      // 루트 .env의 VITE_CHAT_API_KEY를 사용
      'process.env.VITE_CHAT_API_KEY': JSON.stringify(env.VITE_CHAT_API_KEY),
    }
  };
});
