import type { ReactNode } from 'react'
import { Sheet } from './Sheet'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modal uses Sheet so mobile gets drag-handle bottom sheet; desktop stays centered. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      {children}
    </Sheet>
  )
}
