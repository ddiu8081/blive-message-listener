import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
})