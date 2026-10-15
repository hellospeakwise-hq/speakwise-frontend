'use client'

import type { ElementType } from "react"
import { Link2, Mail } from "lucide-react"
import { FaWhatsapp, FaLinkedin, FaFacebook, FaXTwitter } from "react-icons/fa6"
import { toast } from "sonner"

interface ShareTalkProps {
    url: string
    title: string
    message: string
}

export function ShareTalk({ url, title, message }: ShareTalkProps) {
    const encodedUrl = encodeURIComponent(url)
    const subject = encodeURIComponent(title)
    const text = encodeURIComponent(message)

    const targets: { label: string; icon: ElementType; color: string; href: string }[] = [
        { label: "WhatsApp", icon: FaWhatsapp as unknown as ElementType, color: "text-[#25D366]", href: `https://wa.me/?text=${text}%20${encodedUrl}` },
        { label: "LinkedIn", icon: FaLinkedin as unknown as ElementType, color: "text-[#0A66C2]", href: `https://www.linkedin.com/feed/?shareActive=true&text=${text}%20${encodedUrl}` },
        { label: "Facebook", icon: FaFacebook as unknown as ElementType, color: "text-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${text}` },
        { label: "X", icon: FaXTwitter as unknown as ElementType, color: "text-foreground", href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}` },
        { label: "Email", icon: Mail, color: "text-muted-foreground", href: `mailto:?subject=${subject}&body=${text}%0A%0A${encodedUrl}` },
    ]

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${message}\n${url}`)
            toast.success("Message and link copied")
        } catch {
            toast.error("Couldn't copy the link")
        }
    }

    const buttonClass = "rounded-full p-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

    return (
        <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold">Share this talk</h3>
            <div className="flex flex-wrap items-center gap-2">
                {targets.map(({ label, icon: Icon, color, href }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share on ${label}`}
                        title={label}
                        className={buttonClass}
                    >
                        <Icon className={`h-6 w-6 ${color}`} />
                    </a>
                ))}
                <button
                    type="button"
                    onClick={copyLink}
                    aria-label="Copy link"
                    title="Copy link"
                    className={buttonClass}
                >
                    <Link2 className="h-6 w-6 text-muted-foreground" />
                </button>
            </div>
        </div>
    )
}
