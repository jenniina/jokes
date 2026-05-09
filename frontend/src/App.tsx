import { useRef } from 'react'
import './css/App.css'
import './css/form.css'
import Nav from './components/Nav/Nav'
import Modal from './components/Modal/Modal'
import Notification from './components/Notification/Notification'
import MainWrapper from './components/MainWrapper/MainWrapper'
import { RefObject } from './types'
import { UIProvider } from './contexts/UIContext'
import { ConfirmProvider } from './contexts/ConfirmContext'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

const App = () => {
  const menuStyleRef = useRef({ getStyle: () => false }) as RefObject<{
    getStyle: () => boolean
  }>

  return (
    <>
      <UIProvider menuStyle={menuStyleRef}>
        <ConfirmProvider>
          <Nav ref={menuStyleRef} />
          <MainWrapper />
          <Footer />
          <ScrollToTop />
          <Modal />
          <Notification />{' '}
        </ConfirmProvider>
      </UIProvider>
    </>
  )
}

export default App
