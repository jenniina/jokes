import type { Config } from 'vike/types'

export default {
  // Enable SSG for all pages
  prerender: true,

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
