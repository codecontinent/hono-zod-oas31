import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      thresholds: {
        autoUpdate: true,
      },
    },
    globals: true,
    include: ['src/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.json',
      enabled: true,
    },
  },
})
