import react from '@vitejs/plugin-react'; // 👈 これを追加
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()], // 👈 これを追加
  build: {
    outDir: "dist",
  },
});