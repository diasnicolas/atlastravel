import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' → o build funciona servido a partir de qualquer subcaminho
export default defineConfig({
  base: './',
  plugins: [react()],
});
