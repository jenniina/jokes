import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import copy from 'rollup-plugin-copy'
import { resolve } from 'node:path'

const isDebug = process.env.NODE_ENV === 'debug'
const dedupedPackages = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
]

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // {
    // jsxRuntime: "automatic",
    // }
    vike(),
    {
      ...copy({
        targets: [
          {
            src: 'routes.json',
            dest: resolve(__dirname, '../dist/frontend'),
          },
        ],
        hook: 'writeBundle', // run the plugin after all the files are bundled and written to disk
        copyOnce: true,
      }),
      enforce: 'post', // run the plugin after all the other plugins
    },
  ],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      'react-helmet-async': resolve(
        __dirname,
        'node_modules/react-helmet-async/lib/index.esm.js'
      ),
    },
    dedupe: dedupedPackages,
  },
  base: '/',

  // define: {
  //   "process.env.NODE_ENV": '"development"',
  //   __DEV__: true,
  // },

  // resolve: {
  //   alias: {
  //     react: path.resolve("node_modules/react/index.js"),
  //     "react-dom": path.resolve("node_modules/react-dom/index.js"),
  //     "react-dom/server": path.resolve("node_modules/react-dom/server.js"),
  //   },
  //   conditions: ["import", "module", "browser", "default"],
  //   mainFields: ["module", "main"],
  // },

  // // Add define to fix exports issue
  // define: {
  //   // Fix CommonJS exports for ESM
  //   global: "globalThis",
  //   "process.env.NODE_ENV": JSON.stringify(
  //     process.env.NODE_ENV || "development"
  //   ),
  // },

  build: {
    // Write to the regular outDir by default, but allow a local outDir for analysis
    outDir: process.env.ANALYZE
      ? resolve(__dirname, 'dist')
      : resolve(__dirname, '../dist/frontend'),
    minify: isDebug ? false : 'terser',
    sourcemap: true,
    target: 'es2015',
    rollupOptions: {
      external: [],
      output: isDebug
        ? {
            manualChunks: undefined,
          }
        : {
            manualChunks(id) {
              // Don't chunk react-icons - let dynamic imports work
              // Note: Commenting this out to allow react-icons to be properly resolved
              // if (id.includes('node_modules/react-icons')) {
              //   return 'lib-react-icons'
              // }

              // Keep the default node_modules chunking by package
              if (id.includes('node_modules')) {
                return id
                  .toString()
                  .split('node_modules/')[1]
                  .split('/')[0]
                  .toString()
              }

              // Keep tightly-coupled app internals in one shared chunk so
              // manual chunking doesn't create circular chunk dependencies.
              if (
                /src[\\/](hooks|utils|contexts|reducers|services)([\\/]|$)/.test(
                  id
                ) ||
                /src[\\/]components[\\/]Confirm([\\/]|$)/.test(id)
              ) {
                return 'app-shared'
              }

              // Split pages into per-folder chunks to avoid huge `src_pages` bundle
              const pagesMatch = id.match(/src[\/\\]pages[\/\\](.+)/)
              if (pagesMatch) {
                const rest = pagesMatch[1]
                const parts = rest.split(/[\/\\]/)
                // If a nested folder like pages-portfolio appears, use the next segment as the page name
                const pageName =
                  parts[0] === 'pages-portfolio' && parts[1]
                    ? parts[1]
                    : parts[0]
                return `page-${pageName}`
              }

              // Split heavy top-level components into their own chunks
              const compMatch = id.match(/src[\/\\]components[\/\\]([^\/\\]+)/)
              if (compMatch) {
                return `component-${compMatch[1]}`
              }
            },
          },
    },
    emptyOutDir: true,
  },
  ssr: {
    // Bundle all node_modules for SSR to ensure pre-rendering works reliably
    // in our build environment (pre-render scripts run from the dist folder
    // without a node_modules layout). We can revisit more granular
    // externalization later if we deploy compiled server with proper
    // node_modules resolution.
    noExternal: command === 'build' ? true : ['react-helmet-async'],
  },

  // ssr: {
  //   // Try with specific noExternal instead of true
  //   noExternal: [
  //     "react",
  //     "react-dom",
  //     "react-router-dom",
  //     "react-redux",
  //     "@reduxjs/toolkit",
  //     // Don't bundle Vike - let it handle its own CommonJS
  //   ],
  //   target: "node",
  //   format: "esm",
  // },

  // optimizeDeps: {
  //   // Remove jsx-runtime from include to fix the warning
  //   include: ["react", "react-dom", "react-router-dom"],
  //   force: true,
  //   esbuildOptions: {
  //     target: "es2020",
  //     format: "esm",
  //   },
  // },
}))
