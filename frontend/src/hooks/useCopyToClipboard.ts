'use client'

import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Copy text to clipboard and show a toast notification.
 */
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedText(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [])

  return { copy, copiedText }
}
