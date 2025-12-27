"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { userApi, UserProfileResponse, SkillTag } from "@/lib/api/userApi"
import { speakerApi } from "@/lib/api/speakerApi"
import { Upload, X, Building2, ArrowRight, CheckCircle2, Clock, Award } from "lucide-react"
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"
import { organizationApi, Organization } from "@/lib/api/organizationApi"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { profileOnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"
import { AddExperienceDialog } from "@/components/speakers/add-experience-dialog"
import { ExperiencesList } from "@/components/speakers/experiences-list"
import { ProfileCompletionTracker } from "@/components/profile/profile-completion-tracker"

export default function ProfilePage() {
    const { user } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
    const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(false)

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
    const [availableSkills, setAvailableSkills] = useState<SkillTag[]>([])
    const [newSkillName, setNewSkillName] = useState("")
    const [avatarKey, setAvatarKey] = useState(Date.now()) // Cache buster for avatar image

    // Mark component as mounted to prevent hydration mismatches
    useEffect(() => {
        setMounted(true)
    }, [])

    // Load profile data on mount
    useEffect(() => {
        if (mounted) {
            loadProfile()
            loadAvailableSkills()
            loadOrganizations()
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
                setSkillTags(speakerData.skill_tag || [])
            }
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

    const loadAvailableSkills = async () => {
        try {
            const tags = await speakerApi.getSkillTags()
            setAvailableSkills(tags as any)
        } catch (error: any) {
            // Silently handle 404 - endpoint not implemented yet
            setAvailableSkills([]) // Set empty array as fallback
        }
    }

    const loadOrganizations = async () => {
        try {
            setIsLoadingOrgs(true)
            const data = await organizationApi.getUserOrganizations()
            setOrganizations(data)
        } catch (error: any) {
            // Silently handle 404 - endpoint not implemented yet
            if (error?.response?.status !== 404) {
                console.error('Failed to load organizations:', error)
            }
            setOrganizations([]) // Set empty array as fallback
        } finally {
            setIsLoadingOrgs(false)
        }
    }

    const handleSaveProfile = async () => {
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
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || error.message
                || "Failed to update profile"
            toast.error(errorMessage)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const data = profileData as any
            const speakerData = Array.isArray(data?.speaker) ? data?.speaker[0] : data?.speaker
            
            if (!speakerData?.id) {
                toast.error("Speaker profile not found")
                return
            }
            
            // Upload avatar via /api/users/me/ with multipart form data
            const formData = new FormData()
            formData.append('speaker[0]id', speakerData.id.toString())
            formData.append('speaker[0]user_account', speakerData.user_account)
            formData.append('speaker[0]avatar', file)
            
            console.log('📤 Uploading avatar for speaker ID:', speakerData.id)
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/me/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: formData
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                console.error('❌ Avatar upload failed:', errorData)
                throw new Error(errorData.detail || 'Failed to upload avatar')
            }
            
            toast.success("Avatar uploaded successfully")
            
            // Force refresh the image by updating the cache key
            setAvatarKey(Date.now())
            
            // Reload to get fresh data from server
            const freshData = await userApi.getUserProfile()
            setProfileData(freshData)
        } catch (error: any) {
            console.error('Failed to upload avatar:', error)
            toast.error(error.message || "Failed to upload avatar")
        }
        
        // Reset the input so the same file can be selected again
        event.target.value = ''
    }

    const addSkillTag = async () => {
        if (!newSkillName.trim()) return

        try {
            const newTag = await speakerApi.createSkillTag(newSkillName.trim())
            setAvailableSkills(prev => [...prev, newTag as any])
            setSkillTags(prev => [...prev, newTag as any])
            setNewSkillName("")
            toast.success("Skill added successfully")
        } catch (error) {
            console.error('Failed to add skill:', error)
            toast.error("Failed to add skill")
        }
    }

    const toggleSkillTag = (skill: SkillTag) => {
        setSkillTags(prev => {
            const exists = prev.find(tag => tag.id === skill.id)
            if (exists) {
                return prev.filter(tag => tag.id !== skill.id)
            } else {
                return [...prev, skill]
            }
        })
    }

    const removeSkillTag = (skillId: number) => {
        setSkillTags(prev => prev.filter(tag => tag.id !== skillId))
    }

    const handleCreateOrganization = () => {
        setIsCreateOrgDialogOpen(true)
    }

    const handleOrganizationSuccess = () => {
        loadOrganizations()
    }

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
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                            <p className="text-muted-foreground">Manage your personal information</p>
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
                                
                                // Add cache-busting parameter to force browser to reload image
                                const getAvatarSrc = () => {
                                    if (!avatarUrl) return ''
                                    const baseUrl = avatarUrl.startsWith('http')
                                        ? avatarUrl
                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${avatarUrl}`
                                    return `${baseUrl}?t=${avatarKey}`
                                }
                                
                                return (
                                    <div className="flex items-center space-x-4">
                                        {avatarUrl && (
                                            <div className="relative">
                                                <img
                                                    src={getAvatarSrc()}
                                                    alt="Profile"
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                            <label htmlFor="avatar-upload">
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer"
                                                    asChild
                                                >
                                                    <span>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {avatarUrl ? 'Change Picture' : 'Upload Picture'}
                                                    </span>
                                                </Button>
                                            </label>
                                            {avatarUrl && (
                                                <p className="text-xs text-muted-foreground">
                                                    Current image: {avatarUrl.split('/').pop()}
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

                    {/* Speaker Profile */}
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


                    {/* Skills Management */}
                    <Card data-tour="skills">
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                            <CardDescription>Add your skills and areas of expertise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Current Skills */}
                                <div className="space-y-2">
                                    <Label>Your Skills</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {skillTags.map((skill) => (
                                            <Badge key={skill.id} variant="secondary" className="text-sm">
                                                {skill.name}
                                                {isEditing && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="ml-2 h-auto p-0"
                                                        onClick={() => removeSkillTag(skill.id)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </Badge>
                                        ))}
                                        {skillTags.length === 0 && (
                                            <p className="text-muted-foreground">No skills added yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Add Skills */}
                                {isEditing && (
                                    <div className="space-y-3">
                                        <Label>Available Skills</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSkills
                                                .filter(skill => !skillTags.find(tag => tag.id === skill.id))
                                                .map((skill) => (
                                                    <Badge
                                                        key={skill.id}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                        onClick={() => toggleSkillTag(skill)}
                                                    >
                                                        {skill.name}
                                                    </Badge>
                                                ))}
                                        </div>

                                        <div className="flex space-x-2">
                                            <Input
                                                value={newSkillName}
                                                onChange={(e) => setNewSkillName(e.target.value)}
                                                placeholder="Add a new skill"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillTag())}
                                            />
                                            <Button onClick={addSkillTag} disabled={!newSkillName.trim()}>
                                                Add Skill
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Speaking Experiences Summary - Only show if user has speaker profile */}
                    {profileData?.speaker && (
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

                    {/* Organization Summary */}
                    <Card data-tour="organizations">
                        <CardHeader>
                            <CardTitle>Organizations</CardTitle>
                            <CardDescription>Your organization memberships</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingOrgs ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    Loading organizations...
                                </div>
                            ) : organizations.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        {organizations.filter(org => org.is_active).length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium">
                                                    {organizations.filter(org => org.is_active).length} Approved
                                                </span>
                                            </div>
                                        )}
                                        {organizations.filter(org => !org.is_active).length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm font-medium">
                                                    {organizations.filter(org => !org.is_active).length} Pending Approval
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link href="/organizations" className="flex-1" data-tour="view-orgs">
                                            <Button variant="outline" className="w-full">
                                                View All Organizations
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                        <Button onClick={handleCreateOrganization} className="w-full sm:w-auto" data-tour="create-org-button">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            Create New
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Create an organization to manage events and invite team members as organizers.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button onClick={handleCreateOrganization} className="w-full sm:w-auto">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            Create Organization
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Profile Button - At the bottom */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-end space-x-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button onClick={handleSaveProfile}>Save Changes</Button>
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

            {/* Create Organization Dialog */}
            <CreateOrganizationDialog
                open={isCreateOrgDialogOpen}
                onOpenChange={setIsCreateOrgDialogOpen}
                onSuccess={handleOrganizationSuccess}
            />

            {/* Onboarding Tour */}
            <OnboardingTour
                steps={profileOnboardingSteps}
                run={shouldShowOnboarding && !isLoadingProfile}
                onComplete={completeOnboarding}
            />
        </ProtectedRoute>
    )
}
