/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      // include: ['src/**', 'tests/**'],
      reporter: ['lcov', 'json', 'text'],
    },
    // reporters: [
    //     ['vitest-sonar-reporter', { outputFile: 'sonar-report.xml' }],
    // ],
  }
})


