"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Building2, Loader2 } from "lucide-react"

interface CreateOrganizationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({ open, onOpenChange }: CreateOrganizationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        website: "",
        logo: "",
    })

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
            // Prepare the request payload
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                email: formData.email.trim(),
                website: formData.website.trim() || undefined,
                logo: formData.logo.trim() || undefined,
                is_active: true, // Default to true as per API schema
            }

            const token = localStorage.getItem('accessToken')
            
            const response = await fetch('http://127.0.0.1:8000/api/organizations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create organization')
            }

            const data = await response.json()
            console.log('Organization created:', data)

            // Show success message
            toast.success(
                "Organization request submitted successfully! 🎉",
                {
                    description: "Your request is waiting approval from the admin. Keep an eye on your email for approval or rejection notice.",
                    duration: 8000,
                }
            )

            // Reset form and close dialog
            setFormData({
                name: "",
                description: "",
                email: "",
                website: "",
                logo: "",
            })
            onOpenChange(false)

            // Optional: Trigger a page refresh or data refetch
            setTimeout(() => {
                window.location.reload()
            }, 2000)

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

    const handleCancel = () => {
        setFormData({
            name: "",
            description: "",
            email: "",
            website: "",
            logo: "",
        })
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

                        {/* Logo URL */}
                        <div className="space-y-2">
                            <Label htmlFor="logo" className="text-sm font-medium">
                                Logo URL <span className="text-muted-foreground text-xs">(Optional)</span>
                            </Label>
                            <Input
                                id="logo"
                                type="url"
                                placeholder="https://www.organization.com/logo.png"
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                disabled={isSubmitting}
                                className="text-base"
                            />
                            <p className="text-xs text-muted-foreground leading-tight">
                                Provide a direct link to your organization&apos;s logo image
                            </p>
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
