import type { Config } from 'vike/types'

export default {
  // Pre-render the known entry route while keeping the server bundle for SSR.
  prerender: {
    partial: true,
    keepDistServer: true,
  },

  route: '*',

  // Client-side routing
  clientRouting: true,

  hydrationCanBeAborted: true,

  // Pass page context to client
  passToClient: ['pageProps'],

  meta: {
    // Define meta configurations
    title: {
      env: { server: true, client: true },
    },
    description: {
      env: { server: true },
    },
  },
} satisfies Config
