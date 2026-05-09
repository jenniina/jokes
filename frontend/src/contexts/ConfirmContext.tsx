import { createContext, useState, useCallback, ReactNode, useContext } from 'react'
import Confirm from '../components/Confirm/Confirm'

interface ConfirmOptions {
  message: string
  confirmText?: string
  cancelText?: string
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx.showConfirm
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })
  const [resolver, setResolver] = useState<(result: boolean) => void>()

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>(resolve => {
      setResolver(() => resolve)
    })
  }, [])

  const handleClose = (result: boolean) => {
    setOpen(false)
    if (resolver) resolver(result)
  }

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {open && (
        <Confirm
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  )
}
