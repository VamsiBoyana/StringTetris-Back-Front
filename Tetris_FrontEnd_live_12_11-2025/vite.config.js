// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// vite.config.js
// export default defineConfig({
//   server: {
//     host: '192.168.7.90', // or '0.0.0.0' for all interfaces
//     port: 5173 // optional
//   }
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    vitePluginBundleObfuscator({
      enable: mode === 'production', // Enable only in production
      autoExcludeNodeModules: true,
      options: {
        compact: true,
        controlFlowFlattening: true,
        selfDefending: true,
      }
    })
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove all console logs
        drop_debugger: true // Remove debugger statements
      }
    },
    sourcemap: false // Disable source maps entirely for better security
  },
  // Prevent environment variable leakage
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));