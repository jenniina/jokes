import App from '../App'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import store from '../store'
import '../css/index.css'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ModalProvider } from '../hooks/useModal'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AppProps } from '../types'

export default function Page({ pageContext }: AppProps) {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server-side: Use StaticRouter
    return (
      <StrictMode>
        <StaticRouter location={pageContext.urlPathname ?? '/'}>
          <LanguageProvider>
            <ThemeProvider>
              <Provider store={store}>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </Provider>
            </ThemeProvider>
          </LanguageProvider>
        </StaticRouter>
      </StrictMode>
    )
  }

  // Client-side: Use BrowserRouter
  return (
    <StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <LanguageProvider>
          <ThemeProvider>
            <Provider store={store}>
              <ModalProvider>
                <App />
              </ModalProvider>
            </Provider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </StrictMode>
  )
}
