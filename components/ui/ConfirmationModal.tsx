'use client'

import React from 'react'
import { Modal } from './Modal'
import { Button } from './button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  isConfirming?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isConfirming = false,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="text-gray-600 dark:text-gray-300 mb-6">{children}</div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? 'Confirming...' : confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}