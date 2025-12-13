'use client'

import { useEffect } from 'react'

export function DisableConsole() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {}
      console.error = () => {}
      console.warn = () => {}
      console.info = () => {}
      console.debug = () => {}
    }
  }, [])

  return null
}
