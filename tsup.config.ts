import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm', 'cjs'],
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
})