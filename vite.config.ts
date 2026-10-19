import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Đường dẫn tương đối để chạy được trên GitHub Pages (https://<user>.github.io/<repo>/) mà không phải ghi cứng tên repo.
    base: './',
    plugins: [react(), tailwindcss()],
  };
});
