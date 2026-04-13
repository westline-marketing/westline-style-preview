import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['dist', 'node_modules', 'examples'],
    environmentMatchGlobs: [
      ['src/core/persistence.test.ts', 'jsdom'],
    ],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
})
