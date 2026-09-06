"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Upload, X, Check } from "lucide-react"
import {
    Microphone,
    Buildings,
    UserCircle,
    Medal,
    CalendarCheck,
    ShieldCheck,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { organizationApi } from "@/lib/api/organizationApi"
import { toast } from "sonner"

type Step = "choose" | "org-form"
type RoleType = "speaker" | "organization"

interface ProfileTypeModalProps {
    open: boolean
    onSpeakerChosen: () => void
    onOrgChosen: () => void
}

export function ProfileTypeModal({ open, onSpeakerChosen, onOrgChosen }: ProfileTypeModalProps) {
    const [step, setStep] = useState<Step>("choose")
    const [selectedRole, setSelectedRole] = useState<RoleType>("speaker")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [brandingFile, setBrandingFile] = useState<File | null>(null)
    const [brandingPreview, setBrandingPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: "",
        description: "",
        website: "",
        contact_email: "",
    })

    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setBrandingFile(file)
        setBrandingPreview(URL.createObjectURL(file))
    }

    const removeBranding = () => {
        setBrandingFile(null)
        setBrandingPreview(null)
    }

    const handleOrgSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return toast.error("Organization name is required")
        setIsSubmitting(true)
        try {
            const created = await organizationApi.createOrganization({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                website: form.website.trim() || undefined,
                contact_email: form.contact_email.trim() || undefined,
                branding: brandingFile ?? undefined,
            })
            localStorage.setItem("profile_type", "organization")
            // Cache so profile page and dashboard can read it before approval / list endpoint surfaces it
            localStorage.setItem("cached_org_profile", JSON.stringify(created))
            toast.success("Organization submitted! We'll review it shortly.")
            onOrgChosen()
        } catch (err: any) {
            const data = err?.response?.data ?? {}
            if (data.name?.[0]?.toLowerCase().includes("already exists")) {
                toast.error("An organization with this name already exists. Please choose a different name.")
            } else if (data.owner?.[0]?.toLowerCase().includes("already exists")) {
                toast.error("You already have an organization profile.")
            } else {
                toast.error(data.name?.[0] || data.detail || "Failed to create organization")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleContinue = () => {
        if (selectedRole === "speaker") {
            localStorage.setItem("profile_type", "speaker")
            onSpeakerChosen()
        } else {
            setStep("org-form")
        }
    }

    const handleDismiss = () => {
        localStorage.setItem("profile_type", "speaker")
        onSpeakerChosen()
    }

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent
                className={cn(
                    "sm:max-w-[500px] p-0 gap-0 overflow-hidden border-0 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)]",
                    "bg-white text-zinc-900 rounded-[28px]",
                    "[&>button]:hidden"
                )}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {step === "choose" ? (
                            <motion.div
                                key="choose-view"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="p-7 sm:p-8"
                            >
                                {/* Header with Editorial Serif Title and Clean Close Button */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="font-heading text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900 leading-tight">
                                            Welcome to SpeakWise
                                        </h2>
                                        <p className="text-[13px] text-zinc-500 mt-1">
                                            Choose how you'd like to get started
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDismiss}
                                        className="h-8 w-8 rounded-xl border border-zinc-200/80 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Selection Label */}
                                <div className="mb-2.5">
                                    <span className="text-[13px] font-medium text-zinc-800">
                                        Choose your profile type
                                    </span>
                                </div>

                                {/* Choice Cards side-by-side */}
                                <div className="grid grid-cols-2 gap-3.5 mb-6">
                                    {/* Speaker Card */}
                                    <div
                                        onClick={() => setSelectedRole("speaker")}
                                        className={cn(
                                            "relative flex flex-col justify-between rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 select-none",
                                            selectedRole === "speaker"
                                                ? "border-2 border-zinc-950 bg-white ring-4 ring-zinc-950/5 shadow-sm"
                                                : "border border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                                        )}
                                    >
                                        <div>
                                            {/* Speaker Icon Badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100">
                                                    <Microphone weight="duotone" size={20} color="#18181b" />
                                                </div>
                                                {selectedRole === "speaker" && (
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-white">
                                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-sm text-zinc-900 leading-tight">
                                                Speaker
                                            </h3>
                                            <p className="text-[11.5px] text-zinc-500 mt-1 leading-snug">
                                                Share talks, build your portfolio, and find CFPs.
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-2.5 border-t border-zinc-100 flex items-center gap-3 text-[11px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <UserCircle weight="duotone" size={13} />
                                                Personal
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Medal weight="duotone" size={13} />
                                                Free
                                            </span>
                                        </div>
                                    </div>

                                    {/* Organization Card */}
                                    <div
                                        onClick={() => setSelectedRole("organization")}
                                        className={cn(
                                            "relative flex flex-col justify-between rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 select-none",
                                            selectedRole === "organization"
                                                ? "border-2 border-zinc-950 bg-white ring-4 ring-zinc-950/5 shadow-sm"
                                                : "border border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                                        )}
                                    >
                                        <div>
                                            {/* Organization Icon Badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100">
                                                    <Buildings weight="duotone" size={20} color="#18181b" />
                                                </div>
                                                {selectedRole === "organization" && (
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-white">
                                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-sm text-zinc-900 leading-tight">
                                                Organization
                                            </h3>
                                            <p className="text-[11.5px] text-zinc-500 mt-1 leading-snug">
                                                Host events, post CFPs, and recruit top speakers.
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-2.5 border-t border-zinc-100 flex items-center gap-3 text-[11px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <CalendarCheck weight="duotone" size={13} />
                                                Events
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck weight="duotone" size={13} />
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dark Action Button matching entire app */}
                                <Button
                                    type="button"
                                    onClick={handleContinue}
                                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-sm py-3.5 h-auto rounded-2xl shadow-sm transition-all active:scale-[0.99]"
                                >
                                    {selectedRole === "speaker" ? "Continue as Speaker" : "Continue to Organization Setup"}
                                </Button>

                                <p className="text-center text-[11.5px] text-zinc-400 mt-3.5">
                                    You can switch or manage both profiles from settings anytime.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form-view"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.2 }}
                                className="p-7 sm:p-8"
                            >
                                {/* Back button */}
                                <div className="flex items-center justify-between mb-5">
                                    <button
                                        type="button"
                                        onClick={() => setStep("choose")}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDismiss}
                                        className="h-8 w-8 rounded-xl border border-zinc-200/80 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div>
                                    <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
                                        Organization details
                                    </h2>
                                    <p className="text-[13px] text-zinc-500 mt-1 mb-5">
                                        We verify organizations to keep speaker opportunities spam-free.
                                    </p>
                                </div>

                                <form onSubmit={handleOrgSubmit} className="space-y-3.5">
                                    {/* Logo / Branding */}
                                    <div>
                                        <Label className="text-xs font-medium text-zinc-700 mb-1.5 block">
                                            Organization Logo
                                        </Label>
                                        {brandingPreview ? (
                                            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                                <img src={brandingPreview} alt="branding preview" className="w-full h-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={removeBranding}
                                                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center justify-center gap-2.5 w-full h-16 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 cursor-pointer transition-colors bg-[#f8f9fa] hover:bg-[#f1f3f5]">
                                                <Upload className="h-4 w-4 text-zinc-400" />
                                                <span className="text-xs text-zinc-600">Upload logo (PNG, JPG, or SVG)</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleBrandingChange} />
                                            </label>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="org-name" className="text-xs font-medium text-zinc-700">
                                            Organization Name *
                                        </Label>
                                        <Input
                                            id="org-name"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            placeholder="e.g. NextGen Web Summit"
                                            className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="org-desc" className="text-xs font-medium text-zinc-700">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="org-desc"
                                            value={form.description}
                                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                            placeholder="What kind of talks and events do you host?"
                                            rows={2}
                                            className="mt-1 resize-none bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm placeholder:text-zinc-400 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="org-website" className="text-xs font-medium text-zinc-700">
                                                Website
                                            </Label>
                                            <Input
                                                id="org-website"
                                                type="url"
                                                value={form.website}
                                                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                                                placeholder="https://..."
                                                className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="org-email" className="text-xs font-medium text-zinc-700">
                                                Contact Email
                                            </Label>
                                            <Input
                                                id="org-email"
                                                type="email"
                                                value={form.contact_email}
                                                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                                                placeholder="hello@org.com"
                                                className="mt-1 bg-[#f4f5f7] border-transparent focus:border-zinc-300 focus:bg-white rounded-xl text-zinc-900 text-sm h-10 placeholder:text-zinc-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !form.name.trim()}
                                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-sm py-3.5 h-auto rounded-2xl shadow-sm mt-2 transition-all"
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}
