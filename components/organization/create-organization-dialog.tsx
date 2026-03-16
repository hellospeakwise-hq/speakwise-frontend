"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Building2, Loader2, Upload, X, ImageIcon } from "lucide-react"

interface CreateOrganizationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateOrganizationDialog({ open, onOpenChange, onSuccess }: CreateOrganizationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        website: "",
    })
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file")
                return
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image must be less than 10MB")
                return
            }
            setLogoFile(file)
            // Create preview URL
            const previewUrl = URL.createObjectURL(file)
            setLogoPreview(previewUrl)
        }
    }

    const removeLogo = () => {
        setLogoFile(null)
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview)
            setLogoPreview(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            toast.error("Organization name is required")
            return
        }
        if (!formData.description.trim()) {
            toast.error("Description is required")
            return
        }
        if (!formData.email.trim()) {
            toast.error("Email is required")
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSubmitting(true)

        try {
            // Use FormData for multipart/form-data (required for file upload)
            const submitData = new FormData()
            submitData.append('name', formData.name.trim())
            submitData.append('description', formData.description.trim())
            submitData.append('email', formData.email.trim())
            if (formData.website.trim()) {
                submitData.append('website', formData.website.trim())
            }
            if (logoFile) {
                submitData.append('logo', logoFile)
            }
            submitData.append('is_active', 'false') // Default to false, requires admin approval

            const token = localStorage.getItem('accessToken')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

            const response = await fetch(`${apiUrl}/api/organizations/`, {
                method: 'POST',
                headers: {
                    // Do NOT set Content-Type — browser sets it automatically
                    // with the correct multipart boundary
                    'Authorization': `Bearer ${token}`,
                },
                body: submitData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                // Handle field-level errors from Django
                const errorMessages = Object.entries(errorData)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return `${field}: ${messages.join(', ')}`
                        }
                        return `${field}: ${messages}`
                    })
                    .join('\n')
                throw new Error(errorMessages || 'Failed to create organization')
            }

            const data = await response.json()
            console.log('Organization created:', data)

            // Show success message
            toast.success(
                "Organization request submitted successfully! 🎉",
                {
                    description: "Your request is pending admin approval. You'll receive an email notification.",
                    duration: 5000,
                }
            )

            // Reset form and close dialog
            resetForm()
            onOpenChange(false)

            // Trigger success callback to refresh organization list
            if (onSuccess) {
                onSuccess()
            }

        } catch (error: any) {
            console.error('Error creating organization:', error)
            toast.error(
                "Failed to create organization",
                {
                    description: error.message || "Please try again later",
                }
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            email: "",
            website: "",
        })
        removeLogo()
    }

    const handleCancel = () => {
        resetForm()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="w-5 h-5" />
                        Create Organization
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Submit your organization details for admin approval. You&apos;ll receive an email notification once your request is reviewed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4 px-1">
                        {/* Organization Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Organization Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., TechCorp Inc."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isSubmitting}
                                className="text-base"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe your organization and what it does..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                disabled={isSubmitting}
                                rows={4}
                                className="text-base resize-none"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Organization Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@organization.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isSubmitting}
                                className="text-base"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-medium">
                                Website <span className="text-muted-foreground text-xs">(Optional)</span>
                            </Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://www.organization.com"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                disabled={isSubmitting}
                                className="text-base"
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="logo" className="text-sm font-medium">
                                Logo <span className="text-muted-foreground text-xs">(Optional)</span>
                            </Label>
                            {logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-24 h-24 object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Click to upload logo</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                                disabled={isSubmitting}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
