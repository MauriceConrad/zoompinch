// vite.config.ts
import { defineConfig } from "file:///Users/mauriceconrad/Documents/Beruf/creactive/Bluepic/open-source/zoompinch/zoompinch-vue/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/mauriceconrad/Documents/Beruf/creactive/Bluepic/open-source/zoompinch/zoompinch-vue/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import dts from "file:///Users/mauriceconrad/Documents/Beruf/creactive/Bluepic/open-source/zoompinch/zoompinch-vue/node_modules/vite-plugin-dts/dist/index.mjs";
var vite_config_default = defineConfig({
  build: {
    outDir: "./lib",
    lib: {
      entry: path.resolve("src/index.ts"),
      name: "Zoompinch",
      fileName: (format) => `zoompinch.${format}.js`,
      formats: ["es", "umd"]
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        sourcemap: false,
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  plugins: [vue(), dts()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWF1cmljZWNvbnJhZC9Eb2N1bWVudHMvQmVydWYvY3JlYWN0aXZlL0JsdWVwaWMvb3Blbi1zb3VyY2Uvem9vbXBpbmNoL3pvb21waW5jaC12dWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYXVyaWNlY29ucmFkL0RvY3VtZW50cy9CZXJ1Zi9jcmVhY3RpdmUvQmx1ZXBpYy9vcGVuLXNvdXJjZS96b29tcGluY2gvem9vbXBpbmNoLXZ1ZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWF1cmljZWNvbnJhZC9Eb2N1bWVudHMvQmVydWYvY3JlYWN0aXZlL0JsdWVwaWMvb3Blbi1zb3VyY2Uvem9vbXBpbmNoL3pvb21waW5jaC12dWUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICcuL2xpYicsXG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKCdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdab29tcGluY2gnLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGB6b29tcGluY2guJHtmb3JtYXR9LmpzYCxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJyAvKiwgJ2NqcycsICdhbWQnLCAnaWlmZScsICdzeXN0ZW0nKi9dLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndnVlJ10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgICAgLy8gUHJvdmlkZSBnbG9iYWwgdmFyaWFibGVzIHRvIHVzZSBpbiB0aGUgVU1EIGJ1aWxkXG4gICAgICAgIC8vIEFkZCBleHRlcm5hbCBkZXBzIGhlcmVcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHZ1ZTogJ1Z1ZScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFt2dWUoKSwgZHRzKCldLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdjLFNBQVMsb0JBQW9CO0FBQzdkLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxTQUFTO0FBR2hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU8sS0FBSyxRQUFRLGNBQWM7QUFBQSxNQUNsQyxNQUFNO0FBQUEsTUFDTixVQUFVLENBQUMsV0FBVyxhQUFhO0FBQUEsTUFDbkMsU0FBUyxDQUFDLE1BQU0sS0FBMEM7QUFBQSxJQUM1RDtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLEtBQUs7QUFBQSxNQUNoQixRQUFRO0FBQUEsUUFDTixXQUFXO0FBQUEsUUFHWCxTQUFTO0FBQUEsVUFDUCxLQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDeEIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
