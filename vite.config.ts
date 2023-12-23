import { copyFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ include: ['src'], rollupTypes: true, afterBuild: () => copyFileSync("dist/index.d.ts", "dist/index.d.cts") })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'VueConcurrency',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', 'caf'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          caf: 'CAF'
        },
      },
    },
  },
  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with happy-dom
    environment: 'happy-dom',
    coverage: {
      reporter: ['lcov'],
      reportsDirectory: 'coverage',
    }
  }
})