"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      gap={10}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: [
            "group toast",
            "!rounded-2xl !border-0 !shadow-none",
            "!backdrop-blur-xl !backdrop-saturate-150",
            "!bg-white/10 dark:!bg-black/20",
            "!ring-1 !ring-white/20 dark:!ring-white/10",
            "!text-foreground",
            "relative overflow-hidden",
            "before:absolute before:inset-0 before:-z-10",
            "before:rounded-2xl",
            "after:absolute after:inset-0 after:-z-20",
            "after:rounded-2xl",
          ].join(" "),
          title: "!font-semibold !text-sm",
          description: "!text-xs !text-foreground/70",
          success: [
            "!bg-emerald-500/15 dark:!bg-emerald-500/10",
            "!ring-emerald-400/30 dark:!ring-emerald-400/20",
            "!text-emerald-900 dark:!text-emerald-100",
            "[&_[data-icon]]:!text-emerald-500",
          ].join(" "),
          error: [
            "!bg-red-500/15 dark:!bg-red-500/10",
            "!ring-red-400/30 dark:!ring-red-400/20",
            "!text-red-900 dark:!text-red-100",
            "[&_[data-icon]]:!text-red-500",
          ].join(" "),
          warning: [
            "!bg-amber-500/15 dark:!bg-amber-500/10",
            "!ring-amber-400/30 dark:!ring-amber-400/20",
            "!text-amber-900 dark:!text-amber-100",
            "[&_[data-icon]]:!text-amber-500",
          ].join(" "),
          info: [
            "!bg-blue-500/15 dark:!bg-blue-500/10",
            "!ring-blue-400/30 dark:!ring-blue-400/20",
            "!text-blue-900 dark:!text-blue-100",
            "[&_[data-icon]]:!text-blue-500",
          ].join(" "),
          actionButton: "!bg-foreground !text-background !rounded-xl !text-xs !font-semibold",
          cancelButton: "!bg-foreground/10 !text-foreground !rounded-xl !text-xs",
          closeButton: [
            "!border-0 !bg-foreground/10 !text-foreground/60",
            "hover:!bg-foreground/20 !rounded-full",
            "!backdrop-blur-sm",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
