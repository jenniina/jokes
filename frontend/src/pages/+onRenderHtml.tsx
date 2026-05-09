export { onRenderHtml }

import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import React from 'react'
import '../css/index.css'
import { StaticRouter } from 'react-router-dom/server'
import { Provider } from 'react-redux'
import store from '../store.server'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ModalProvider } from '../hooks/useModal'
import { LanguageProvider } from '../contexts/LanguageContext'
import { HelmetProvider } from 'react-helmet-async'
import type { HelmetServerState } from 'react-helmet-async'
import App from '../App'

function onRenderHtml(pageContext: { urlPathname?: string }) {
  const helmetContext: { helmet?: HelmetServerState } = {}
  const pageHtml = renderToString(
    <React.StrictMode>
      <StaticRouter location={pageContext.urlPathname ?? '/'}>
        <LanguageProvider>
          <ThemeProvider>
            <Provider store={store}>
              <HelmetProvider context={helmetContext}>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </HelmetProvider>
            </Provider>
          </ThemeProvider>
        </LanguageProvider>
      </StaticRouter>
    </React.StrictMode>
  )

  const { helmet } = helmetContext

  const helmetTitle = helmet?.title?.toString() ?? ''
  const helmetMeta = helmet?.meta?.toString() ?? ''
  const helmetLink = helmet?.link?.toString() ?? ''

  const defaultTitle = '<title>React Sub Site | Jenniina Laine</title>'
  const defaultDescription =
    '<meta name="description" content="Portfolio and projects by Jenniina Laine" />'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${dangerouslySkipEscape(helmetTitle || defaultTitle)}
        ${dangerouslySkipEscape(helmetMeta || defaultDescription)}
        ${dangerouslySkipEscape(helmetLink)}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
        <div id="modal-root"></div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {},
  }
}
