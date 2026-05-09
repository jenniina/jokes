import { FC, createContext, useState, ReactNode, useContext } from 'react'
import { ModalProps } from '../types'

interface ModalContextType {
  modal: ModalProps | null
  setModal: (modal: ModalProps | null) => void
  show: ({ children, className, title }: ModalProps) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalProps | null>(null)

  const show = ({
    title,
    children,
    className,
  }: {
    children: ReactNode
    className: string
    title: string
  }) => {
    setModal({ children, className, title })
  }

  const closeModal = () => {
    setModal(null)
  }

  return (
    <ModalContext.Provider value={{ modal, setModal, show, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
