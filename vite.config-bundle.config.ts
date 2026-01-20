import { copyFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      include: ["src/config.ts"],
      rollupTypes: true,
      afterBuild: () => {
        try {
          copyFileSync("dist/config.d.ts", "dist/config.d.cts");
        } catch {}
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/config.ts"),
      formats: ["es"],
      fileName: "config",
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
});
