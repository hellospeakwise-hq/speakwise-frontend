'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function Analytics() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Track page views when route changes
        if (typeof window !== 'undefined' && window.umami) {
            window.umami.track(props => ({ ...props, url: pathname }))
        }
    }, [pathname, searchParams])

    return null
}

// Extend Window interface to include umami
declare global {
    interface Window {
        umami?: {
            track: (callback: (props: any) => any) => void
        }
    }
}
