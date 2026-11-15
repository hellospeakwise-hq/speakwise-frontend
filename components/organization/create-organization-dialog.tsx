"use client"

import { useState } from "react"
import NextImage from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { organizationApi, type OrganizationProfile } from "@/lib/api/organizationApi"
import { cn } from "@/lib/utils"

interface CreateOrganizationDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (newOrg: OrganizationProfile) => void
}

export function CreateOrganizationDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [brandingFile, setBrandingFile] = useState<File | null>(null)
  const [brandingPreview, setBrandingPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB")
      return
    }
    setBrandingFile(file)
    setBrandingPreview(URL.createObjectURL(file))
  }

  const handleRemoveBranding = () => {
    setBrandingFile(null)
    if (brandingPreview) URL.revokeObjectURL(brandingPreview)
    setBrandingPreview(null)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setWebsite("")
    setContactEmail("")
    handleRemoveBranding()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Organization name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const created = await organizationApi.createOrganization({
        name: name.trim(),
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        branding: brandingFile || undefined,
      })

      toast.success("Organization submitted! We'll review it shortly.")
      resetForm()
      setIsOpen(false)
      if (onSuccess) {
        onSuccess(created)
      }
    } catch (err: any) {
      const data = err?.response?.data ?? {}
      const rawDetail = data.detail
      const detailStr =
        typeof rawDetail === "string"
          ? rawDetail
          : Array.isArray(rawDetail)
          ? rawDetail.join(" ")
          : ""

      if (typeof data.name?.[0] === "string" && data.name[0].toLowerCase().includes("already exists")) {
        toast.error("An organization with this name already exists. Please choose a different name.")
      } else if (detailStr && detailStr.toLowerCase().includes("maximum number of organizations")) {
        toast.error(detailStr)
      } else if (typeof data.owner?.[0] === "string" && data.owner[0].toLowerCase().includes("already exists")) {
        toast.error("You already have an organization profile.")
      } else {
        toast.error(data.name?.[0] || detailStr || "Failed to create organization")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "sm:max-w-[500px] p-0 gap-0 overflow-hidden border-0 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)]",
          "bg-white text-zinc-900 rounded-[28px]",
          "[&>button]:hidden"
        )}
      >
        <div className="p-7 sm:p-8">
          {/* Header with Close Button (No building icon) */}
          <div className="flex items-center justify-between mb-4">
            <div />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-xl border border-zinc-200/80 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
              Organization details
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1 mb-5">
              We verify organizations to keep speaker opportunities spam-free. You can own up to 3 organizations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Logo / Branding */}
            <div>
              <Label className="text-xs font-medium text-zinc-700 mb-1.5 block">
                Organization Logo
              </Label>
              {brandingPreview ? (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                  <NextImage
                    src={brandingPreview}
                    alt="Branding preview"
                    width={480}
                    height={96}
                    unoptimized
                    className="h-full w-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBranding}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2.5 w-full h-16 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 cursor-pointer transition-colors bg-[#f8f9fa] hover:bg-[#f1f3f5]">
                  <Upload className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs text-zinc-600">Upload logo (PNG, JPG, or SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBrandingChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            <div>
              <Label htmlFor="org-name-input" className="text-xs font-medium text-zinc-700">
                Organization Name *
              </Label>
              <Input
                id="org-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NextGen Web Summit"
                className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="org-desc-input" className="text-xs font-medium text-zinc-700">
                Description
              </Label>
              <Textarea
                id="org-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of talks and events do you host?"
                rows={2}
                className="mt-1 resize-none bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm placeholder:text-zinc-400 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="org-website-input" className="text-xs font-medium text-zinc-700">
                  Website
                </Label>
                <Input
                  id="org-website-input"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="org-email-input" className="text-xs font-medium text-zinc-700">
                  Contact Email
                </Label>
                <Input
                  id="org-email-input"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hello@org.com"
                  className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-sm py-3.5 shadow-sm mt-3 transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
