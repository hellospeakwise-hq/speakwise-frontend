"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect, Suspense } from "react"
import { toast } from "sonner"
import { userApi, UserProfileResponse } from "@/lib/api/userApi"
import { speakerApi, SkillTag } from "@/lib/api/speakerApi"
import { Upload, X, ArrowRight, Award, Sparkles, Loader2, Pencil, Check } from "lucide-react"
// import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"
import { organizationApi, type OrganizationProfile, type CreateOrganizationData } from "@/lib/api/organizationApi"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { profileOnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"
import { AddExperienceDialog } from "@/components/speakers/add-experience-dialog"
import { ProfileCompletionTracker } from "@/components/profile/profile-completion-tracker"
import { SkillsCombobox } from "@/components/profile/skills-combobox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"
import { getDefaultAvatar, getAvatarUrl } from "@/lib/utils"
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog"

function ProfilePageContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
    // const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
    const [cropDialogOpen, setCropDialogOpen] = useState(false)
    // const [organizations, setOrganizations] = useState<Organization[]>([])
    // const [isLoadingOrgs, setIsLoadingOrgs] = useState(false)
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
    const [isOrgUser, setIsOrgUser] = useState(false)
    const [orgProfile, setOrgProfile] = useState<OrganizationProfile | null>(null)
    const [isLoadingOrg, setIsLoadingOrg] = useState(false)
    const [isSavingOrg, setIsSavingOrg] = useState(false)
    const [orgForm, setOrgForm] = useState({ name: "", description: "", website: "", contact_email: "" })
    const [orgBrandingFile, setOrgBrandingFile] = useState<File | null>(null)
    const [orgBrandingPreview, setOrgBrandingPreview] = useState<string | null>(null)
    const [isEditingOrg, setIsEditingOrg] = useState(false)

    // Check if this is a new OAuth user
    useEffect(() => {
        const isNewOAuthUser = searchParams.get('welcome') === 'true' || 
                              sessionStorage.getItem('newOAuthUser') === 'true'
        if (isNewOAuthUser) {
            setShowWelcomeBanner(true)
            // Clear the flag so it doesn't show again
            sessionStorage.removeItem('newOAuthUser')
        }
    }, [searchParams])

    // Onboarding
    const { shouldShowOnboarding, completeOnboarding } = useOnboarding('PROFILE')

    // Form state
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [nationality, setNationality] = useState('')
    const [organization, setOrganization] = useState("")
    const [shortBio, setShortBio] = useState("")
    const [longBio, setLongBio] = useState("")
    const [country, setCountry] = useState("")
    const [skillTags, setSkillTags] = useState<SkillTag[]>([])
    const [avatarKey, setAvatarKey] = useState(Date.now()) // Cache buster for avatar image

    // Mark component as mounted to prevent hydration mismatches
    useEffect(() => {
        setMounted(true)
    }, [])

    // Load profile data on mount
    useEffect(() => {
        if (mounted) {
            loadProfile()
            // loadOrganizations()
            const profileType = localStorage.getItem('profile_type')
            if (profileType === 'organization') {
                setIsOrgUser(true)
                loadOrgProfile()
            }
        }
    }, [mounted])

    // Update form state when profile data loads
    useEffect(() => {
        if (profileData) {
            const data = profileData as any
            
            // Handle user data - could be nested under 'user' or at root level
            const userData = data.user || data
            if (userData) {
                setFirstName(userData.first_name || '')
                setLastName(userData.last_name || '')
                setUsername(userData.username || '')
                setNationality(userData.nationality || '')
            }

            // Handle speaker data - could be nested object, array, or at root
            let speakerData = data.speaker
            if (Array.isArray(speakerData) && speakerData.length > 0) {
                speakerData = speakerData[0] // Take first speaker if array
            }
            
            if (speakerData) {
                setOrganization(speakerData.organization || "")
                setShortBio(speakerData.short_bio || "")
                setLongBio(speakerData.long_bio || "")
                setCountry(speakerData.country || "")
                // Don't set skillTags here - we load them from /speakers/skills/ endpoint
            }
            
            // Load skills after profile data is set
            loadSkills()
        }
    }, [profileData])

    const loadProfile = async () => {
        try {
            setIsLoadingProfile(true)
            const data = await userApi.getUserProfile()
            setProfileData(data)
        } catch (error) {
            console.error('Failed to load profile:', error)
            toast.error("Failed to load profile")
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const loadSkills = async () => {
        try {
            // Load speaker's skills from the new endpoint
            const skills = await speakerApi.getSkills()
            setSkillTags(skills as any)
        } catch (error) {
            // Silently fail - skills will be empty
            console.error('Failed to load skills:', error)
        }
    }

    const loadOrgProfile = async () => {
        try {
            setIsLoadingOrg(true)
            let org = await organizationApi.getMyOrganization()

            // Pending orgs won't appear in the public list yet — fall back to localStorage cache
            if (!org) {
                const cached = localStorage.getItem("cached_org_profile")
                if (cached) {
                    try { org = JSON.parse(cached) } catch { /* ignore */ }
                }
            }

            if (org) {
                // Keep cache in sync with latest API data
                localStorage.setItem("cached_org_profile", JSON.stringify(org))
                setOrgProfile(org)
                setOrgForm({
                    name: org.name ?? "",
                    description: org.description ?? "",
                    website: org.website ?? "",
                    contact_email: org.contact_email ?? "",
                })
                if (org.branding) setOrgBrandingPreview(org.branding)
            }
        } catch {
            // silently ignore — org may not exist yet
        } finally {
            setIsLoadingOrg(false)
        }
    }

    const handleSaveOrg = async () => {
        if (!orgProfile?.id) return
        setIsSavingOrg(true)
        try {
            const updated = await organizationApi.updateOrganization(orgProfile.id, {
                name: orgForm.name,
                description: orgForm.description || undefined,
                website: orgForm.website || undefined,
                contact_email: orgForm.contact_email || undefined,
                branding: orgBrandingFile ?? undefined,
            })
            setOrgProfile(updated)
            setOrgBrandingFile(null)
            toast.success("Organization profile updated")
            setIsEditingOrg(false)
        } catch {
            toast.error("Failed to update organization profile")
        } finally {
            setIsSavingOrg(false)
        }
    }

    // const loadOrganizations = async () => {
    //     try {
    //         setIsLoadingOrgs(true)
    //         const data = await organizationApi.getUserOrganizations()
    //         setOrganizations(data)
    //     } catch (error: any) {
    //         if (error?.response?.status !== 404) {
    //             console.error('Failed to load organizations:', error)
    //         }
    //         setOrganizations([])
    //     } finally {
    //         setIsLoadingOrgs(false)
    //     }
    // }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            const data = profileData as any
            const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker
            
            // Build update data with nested speaker including ID for update (not create)
            const updateData: any = {
                first_name: firstName,
                last_name: lastName,
                username: username,
                nationality: nationality,
            }

            // Add speaker data as nested array with ID to trigger UPDATE not CREATE
            if (speakerData?.id) {
                updateData.speaker = [{
                    id: speakerData.id,  // CRITICAL: Include ID to update existing, not create new
                    user_account: speakerData.user_account,
                    organization: organization,
                    short_bio: shortBio,
                    long_bio: longBio,
                    country: country,
                    // skill_tag excluded - backend expects objects not integers
                }]
            }

            console.log('📤 Sending update with data:', JSON.stringify(updateData, null, 2))
            const updatedProfile = await userApi.updateUserProfile(updateData)
            console.log('📥 Received updated profile:', updatedProfile)

            // Update state with new data
            setProfileData(updatedProfile)
            toast.success("Profile updated successfully")
            setIsEditing(false)

            // Reload to verify
            setTimeout(async () => {
                const freshData = await userApi.getUserProfile()
                setProfileData(freshData)
            }, 500)
        } catch (error: any) {
            console.error('Failed to update profile:', error)
            console.error('Error response:', error.response?.data)
            const data = error.response?.data
            let errorMessage = "Failed to update profile"
            if (data) {
                if (data.detail) {
                    errorMessage = data.detail
                } else if (data.message) {
                    errorMessage = data.message
                } else if (typeof data === 'object') {
                    // Field-level validation errors e.g. { nationality: ["This field may not be blank."] }
                    const fieldErrors = Object.entries(data)
                        .map(([field, msgs]) => {
                            const label = field.replace(/_/g, ' ')
                            const msg = Array.isArray(msgs) ? msgs[0] : msgs
                            return `${label.charAt(0).toUpperCase() + label.slice(1)}: ${msg}`
                        })
                        .join('\n')
                    if (fieldErrors) errorMessage = fieldErrors
                }
            } else if (error.message) {
                errorMessage = error.message
            }
            toast.error(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    // Step 1 — user picks a file → open the crop dialog
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const objectUrl = URL.createObjectURL(file)
        setRawImageSrc(objectUrl)
        setCropDialogOpen(true)
        // Reset input so the same file can be re-selected after cancel
        event.target.value = ''
    }

    // Step 2 — user confirms crop → upload the cropped blob
    const handleCropConfirmed = async (croppedBlob: Blob, previewUrl: string) => {
        setIsUploadingAvatar(true)
        setCurrentAvatarUrl(previewUrl) // optimistic preview

        try {
            const data = profileData as any
            const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker

            if (!speakerData?.id) {
                toast.error("Speaker profile not found")
                setCurrentAvatarUrl(null)
                return
            }

            const formData = new FormData()
            formData.append('speaker[0]id', speakerData.id.toString())
            formData.append('speaker[0]user_account', speakerData.user_account)
            // Convert blob to File so the backend sees a proper filename
            const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
            formData.append('speaker[0]avatar', croppedFile)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/me/`,
                {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                    body: formData,
                },
            )

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.detail || 'Failed to upload avatar')
            }

            const freshData = await userApi.getUserProfile()
            const freshSpeaker = Array.isArray((freshData as any)?.speaker)
                ? (freshData as any).speaker[0]
                : (freshData as any)?.speaker
            const newAvatarPath = freshSpeaker?.avatar

            if (newAvatarPath) {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
                const absoluteUrl = newAvatarPath.startsWith('http')
                    ? newAvatarPath
                    : `${apiBase}${newAvatarPath}`
                const newKey = Date.now()
                setAvatarKey(newKey)
                setCurrentAvatarUrl(`${absoluteUrl}?t=${newKey}`)
            }

            setProfileData(freshData)
            toast.success('Profile picture updated!')
            window.dispatchEvent(new CustomEvent('avatarUpdated'))
        } catch (error: any) {
            console.error('Failed to upload avatar:', error)
            toast.error(error.message || 'Failed to upload avatar')
            setCurrentAvatarUrl(null)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    // Add an EXISTING skill to user's profile by creating it via POST
    const addSkillTag = async (skill: SkillTag) => {
        // Check if already added
        if (skillTags.some(s => s.id === skill.id)) {
            toast.error("Skill already added")
            return
        }
        
        try {
            // POST to /speakers/skills/ to add the skill to user's profile
            await speakerApi.createSkill({ name: skill.name })
            
            // Update local state
            setSkillTags(prev => [...prev, skill])
            toast.success("Skill added successfully")
        } catch (error) {
            console.error('Failed to add skill:', error)
            toast.error("Failed to add skill")
        }
    }

    // CREATE a brand new skill (that doesn't exist in the system yet)
    const createNewSkill = async (name: string): Promise<SkillTag | null> => {
        try {
            // This creates a new skill tag in the system AND adds it to the user
            const newTag = await speakerApi.createSkill({ name })
            setSkillTags(prev => [...prev, newTag])
            toast.success("Skill created and added")
            return newTag
        } catch (error) {
            console.error('Failed to create skill:', error)
            toast.error("Failed to create skill")
            return null
        }
    }

    // Remove a skill from user's profile
    const removeSkillTag = async (skillId: string) => {
        try {
            // DELETE /speakers/skills/{id}/ to remove from user's profile
            await speakerApi.deleteSkill(skillId)
            
            // Update local state
            setSkillTags(prev => prev.filter(tag => tag.id !== skillId))
            toast.success("Skill removed")
        } catch (error) {
            console.error('Failed to remove skill:', error)
            toast.error("Failed to remove skill")
        }
    }

    // const handleCreateOrganization = () => {
    //     setIsCreateOrgDialogOpen(true)
    // }

    // const handleOrganizationSuccess = () => {
    //     loadOrganizations()
    // }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted || isLoadingProfile || !profileData) {
        return (
            <ProtectedRoute>
                <div className="container py-10">
                    <div className="flex justify-center">
                        <div className="text-lg">Loading profile...</div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="container py-10">
                <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col space-y-6 max-w-4xl">
                        {/* Org pending approval banner */}
                        {mounted && typeof window !== 'undefined' && localStorage.getItem('profile_type') === 'organization' && orgProfile?.status !== 'active' && (
                            <div className="rounded-xl border border-border bg-muted/20 p-5 flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <span className="text-xl">🕐</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Organization profile under review</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We review all organization profiles before they go public. This usually takes 1–2 business days. You can update your profile details while you wait.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Welcome Banner for new OAuth users */}
                        {showWelcomeBanner && (
                            <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex">
                                        <Sparkles className="h-5 w-5 text-orange-500 mt-0.5 mr-3" />
                                        <div>
                                            <AlertTitle className="text-orange-800 dark:text-orange-300 text-lg">
                                                Welcome to SpeakWise! 🎉
                                            </AlertTitle>
                                            <AlertDescription className="text-orange-700 dark:text-orange-400 mt-2">
                                                <p>Your account has been created. Complete your profile below to help organizers find you and invite you to speak at their events.</p>
                                                <p className="mt-2 text-sm">Speakers with complete profiles are <span className="font-semibold">3x more likely</span> to receive speaking invitations.</p>
                                            </AlertDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                                        onClick={() => setShowWelcomeBanner(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Alert>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                                <p className="text-muted-foreground">Manage your personal information</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                                <TooltipProvider delayDuration={300}>
                                {isEditing ? (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Cancel</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" className="rounded-full h-10 w-10" onClick={handleSaveProfile} disabled={isSaving}>
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Save Changes</TooltipContent>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" className="rounded-full h-10 w-10" onClick={() => setIsEditing(true)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Profile</TooltipContent>
                                    </Tooltip>
                                )}
                                </TooltipProvider>
                            </div>
                        </div>

                    {/* Profile Picture - First */}
                    <Card data-tour="profile-picture">
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>Upload your profile picture</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const data = profileData as any
                                const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker
                                const avatarUrl = speakerData?.avatar

                                // currentAvatarUrl takes priority (optimistic / post-upload)
                                // fallback to the server URL with cache-buster, then default avatar
                                const getAvatarSrc = () => {
                                    if (currentAvatarUrl) return currentAvatarUrl
                                    if (!avatarUrl) return getDefaultAvatar(user?.email || user?.first_name || 'user')
                                    const base = avatarUrl.startsWith('http')
                                        ? avatarUrl
                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${avatarUrl}`
                                    return `${base}?t=${avatarKey}`
                                }

                                return (
                                    <div className="flex items-center space-x-4">
                                        {/* Avatar preview with upload-progress overlay */}
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <img
                                                src={getAvatarSrc()}
                                                alt="Profile"
                                                className={`w-20 h-20 rounded-full object-cover border-2 border-gray-200 transition-opacity duration-300 ${
                                                    isUploadingAvatar ? 'opacity-40' : 'opacity-100'
                                                }`}
                                            />
                                            {isUploadingAvatar && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="avatar-upload"
                                                disabled={isUploadingAvatar}
                                            />
                                            <label htmlFor="avatar-upload">
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer"
                                                    asChild
                                                    disabled={isUploadingAvatar}
                                                >
                                                    <span>
                                                        {isUploadingAvatar ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-4 h-4 mr-2" />
                                                                {avatarUrl ? 'Change Picture' : 'Upload Picture'}
                                                            </>
                                                        )}
                                                    </span>
                                                </Button>
                                            </label>
                                            {avatarUrl && !isUploadingAvatar && (
                                                <p className="text-xs text-muted-foreground">
                                                    Current image: {avatarUrl.split('/').pop()}
                                                </p>
                                            )}
                                            {isUploadingAvatar && (
                                                <p className="text-xs text-orange-500 font-medium animate-pulse">
                                                    Uploading your picture…
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}
                        </CardContent>
                    </Card>                    {/* Personal Information */}
                    <Card data-tour="personal-info">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your basic account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={(profileData as any)?.user?.email || (profileData as any)?.email || ''}
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Nationality</Label>
                                        <Input
                                            id="nationality"
                                            value={nationality}
                                            onChange={(e) => setNationality(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your nationality"
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Organization Profile — shown instead of speaker sections for org users */}
                    {isOrgUser && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Organization Profile</CardTitle>
                                        <CardDescription>Your organization's public listing details</CardDescription>
                                    </div>
                                    {!isEditingOrg ? (
                                        <Button size="sm" variant="outline" onClick={() => setIsEditingOrg(true)}>
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setIsEditingOrg(false)} disabled={isSavingOrg}>
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSaveOrg} disabled={isSavingOrg || !orgProfile?.id}>
                                                {isSavingOrg ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoadingOrg ? (
                                    <div className="flex items-center gap-3 text-muted-foreground py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Loading organization data…</span>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {/* Branding image */}
                                        <div className="space-y-2">
                                            <Label>Logo / Branding Image</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-500/10 border-2 border-amber-200/40 flex items-center justify-center flex-shrink-0">
                                                    {orgBrandingPreview ? (
                                                        <img src={orgBrandingPreview} alt="Branding" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold text-amber-600">
                                                            {(orgForm.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                {isEditingOrg && (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            id="org-branding-upload"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (!file) return
                                                                setOrgBrandingFile(file)
                                                                setOrgBrandingPreview(URL.createObjectURL(file))
                                                            }}
                                                        />
                                                        <label htmlFor="org-branding-upload">
                                                            <Button variant="outline" size="sm" asChild className="cursor-pointer">
                                                                <span><Upload className="h-3.5 w-3.5 mr-1.5" />Upload Logo</span>
                                                            </Button>
                                                        </label>
                                                        <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG, WebP — max 5 MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="orgName">Organization Name</Label>
                                            <Input
                                                id="orgName"
                                                value={orgForm.name}
                                                onChange={(e) => setOrgForm(f => ({ ...f, name: e.target.value }))}
                                                disabled={!isEditingOrg}
                                                placeholder="Your organization's name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="orgDescription">About</Label>
                                            <Textarea
                                                id="orgDescription"
                                                value={orgForm.description}
                                                onChange={(e) => setOrgForm(f => ({ ...f, description: e.target.value }))}
                                                disabled={!isEditingOrg}
                                                placeholder="Describe your organization, mission, and the events you run…"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="orgWebsite">Website</Label>
                                                <Input
                                                    id="orgWebsite"
                                                    value={orgForm.website}
                                                    onChange={(e) => setOrgForm(f => ({ ...f, website: e.target.value }))}
                                                    disabled={!isEditingOrg}
                                                    placeholder="https://yourorg.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="orgContactEmail">Contact Email</Label>
                                                <Input
                                                    id="orgContactEmail"
                                                    type="email"
                                                    value={orgForm.contact_email}
                                                    onChange={(e) => setOrgForm(f => ({ ...f, contact_email: e.target.value }))}
                                                    disabled={!isEditingOrg}
                                                    placeholder="contact@yourorg.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Speaker Profile — hidden for org users */}
                    {!isOrgUser && (
                    <Card data-tour="speaker-profile">
                        <CardHeader>
                            <CardTitle>Speaker Profile</CardTitle>
                            <CardDescription>Professional information and bio</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Organization</Label>
                                        <Input
                                            id="organization"
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Your company or organization"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Your country"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortBio">Short Bio</Label>
                                    <Input
                                        id="shortBio"
                                        value={shortBio}
                                        onChange={(e) => setShortBio(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="A brief description (255 characters max)"
                                        maxLength={255}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longBio">Biography</Label>
                                    <Textarea
                                        id="longBio"
                                        value={longBio}
                                        onChange={(e) => setLongBio(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself, your experience, and expertise..."
                                        rows={6}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Skills Management — hidden for org users */}
                    {!isOrgUser && (
                    <Card data-tour="skills">
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                            <CardDescription>Add your skills and areas of expertise to help organizers find you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Skill Combobox - Search existing or create new */}
                                <SkillsCombobox
                                    selectedSkills={skillTags}
                                    onSkillAdd={addSkillTag}
                                    onCreateSkill={createNewSkill}
                                />

                                {/* Current Skills */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Your Skills ({skillTags.length})</Label>
                                    {skillTags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {skillTags.map((skill) => (
                                                <Badge 
                                                    key={skill.id} 
                                                    variant="secondary" 
                                                    className="text-sm py-1.5 px-3 flex items-center gap-1.5"
                                                >
                                                    {skill.name}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 hover:bg-destructive/20 rounded-full"
                                                        onClick={() => removeSkillTag(skill.id)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                            <p className="text-muted-foreground text-sm">No skills added yet</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Search for existing skills or create your own
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Speaking Experiences Summary - Only show for speaker users */}
                    {!isOrgUser && profileData?.speaker && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Speaking Experiences
                                </CardTitle>
                                <CardDescription>Manage your conference talks and presentations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Track your speaking engagements, conference talks, and presentations to showcase your expertise.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link href="/dashboard/speaker/experiences" className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                Manage Experiences
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                        <AddExperienceDialog onSuccess={loadProfile} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Organization Summary — temporarily hidden (speaker focus) */}
                    {/* <Card data-tour="organizations">
                        ...
                    </Card> */}

                    {/* Edit Profile Button - At the bottom */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-end space-x-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Sticky Sidebar - Profile Completion Tracker */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            {(() => {
                                const data = profileData as any
                                const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker
                                const trackerData = {
                                    user: data?.user || data,
                                    speaker: speakerData
                                }
                                return (
                                    <ProfileCompletionTracker 
                                        profileData={trackerData} 
                                        onEditClick={() => setIsEditing(true)} 
                                    />
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Organization Dialog — temporarily hidden (speaker focus) */}
            {/* <CreateOrganizationDialog
                open={isCreateOrgDialogOpen}
                onOpenChange={setIsCreateOrgDialogOpen}
                onSuccess={handleOrganizationSuccess}
            /> */}

            {/* Onboarding Tour */}
            <OnboardingTour
                steps={profileOnboardingSteps}
                run={shouldShowOnboarding && !isLoadingProfile}
                onComplete={completeOnboarding}
            />

            {/* Avatar crop dialog — opens when user picks a file */}
            <AvatarCropDialog
                imageSrc={rawImageSrc}
                open={cropDialogOpen}
                onClose={() => setCropDialogOpen(false)}
                onCropComplete={handleCropConfirmed}
            />
        </ProtectedRoute>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <ProtectedRoute>
                <div className="container py-10">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                </div>
            </ProtectedRoute>
        }>
            <ProfilePageContent />
        </Suspense>
    )
}
