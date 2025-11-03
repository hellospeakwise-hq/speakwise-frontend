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
import { Upload, X, Building2 } from "lucide-react"
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"

export default function ProfilePage() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
    const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

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

    // Load profile data on mount
    useEffect(() => {
        loadProfile()
        loadAvailableSkills()
    }, [])

    // Update form state when profile data loads
    useEffect(() => {
        if (profileData) {
            const { user: userData, speaker } = profileData
            
            // User data
            setFirstName(userData.first_name || '')
            setLastName(userData.last_name || '')
            setUsername(userData.username || '')
            setNationality(userData.nationality || '')
            
            // Speaker data
            if (speaker) {
                setOrganization(speaker.organization || "")
                setShortBio(speaker.short_bio || "")
                setLongBio(speaker.long_bio || "")
                setCountry(speaker.country || "")
                setSkillTags(speaker.skill_tag || [])
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
        } catch (error) {
            console.error('Failed to load skill tags:', error)
        }
    }

    const handleSaveProfile = async () => {
        try {
            const updateData: any = {
                user: {
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    nationality: nationality,
                }
            }

            // Add speaker data if user has speaker profile
            if (profileData?.speaker) {
                updateData.speaker = {
                    organization,
                    short_bio: shortBio,
                    long_bio: longBio,
                    country,
                    skill_tag: skillTags.map(tag => tag.id)
                }
            }

            const updatedProfile = await userApi.updateUserProfile(updateData)
            setProfileData(updatedProfile)
            toast.success("Profile updated successfully")
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error("Failed to update profile")
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const updatedProfile = await userApi.uploadAvatar(file)
            setProfileData(updatedProfile)
            toast.success("Avatar uploaded successfully")
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            toast.error("Failed to upload avatar")
        }
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

    if (isLoadingProfile) {
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

    const hasSpeakerProfile = profileData?.speaker !== null && profileData?.speaker !== undefined

    return (
        <ProtectedRoute>
            <div className="container py-10">
                <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information</p>
                    </div>

                    {/* Profile Picture - First */}
                    {hasSpeakerProfile && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                                <CardDescription>Upload your profile picture</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    {profileData.speaker.avatar && (
                                        <div className="relative">
                                            <img
                                                src={profileData.speaker.avatar.startsWith('http') 
                                                    ? profileData.speaker.avatar 
                                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${profileData.speaker.avatar}`
                                                }
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
                                            disabled={isEditing}
                                        />
                                        <label htmlFor="avatar-upload">
                                            <Button 
                                                variant="outline" 
                                                className="cursor-pointer" 
                                                asChild
                                                disabled={isEditing}
                                            >
                                                <span>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    {profileData.speaker.avatar ? 'Change Picture' : 'Upload Picture'}
                                                </span>
                                            </Button>
                                        </label>
                                        {profileData.speaker.avatar && (
                                            <p className="text-xs text-muted-foreground">
                                                Current image: {profileData.speaker.avatar.split('/').pop()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Personal Information */}
                    <Card>
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
                                        value={profileData?.user.email || ''}
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

                    {/* Speaker Details */}
                    {hasSpeakerProfile && (
                        <Card>
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

                    {/* Skills Management */}
                    {hasSpeakerProfile && (
                        <Card>
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
                    )}

                    {/* Organization Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                            <CardDescription>Create and manage your organization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Create an organization to manage events and invite team members as organizers.
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-base">No Organization Yet</h4>
                                        <p className="text-sm text-muted-foreground mt-1">You haven&apos;t created an organization yet.</p>
                                    </div>
                                    <Button onClick={handleCreateOrganization} className="w-full sm:w-auto shrink-0">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Create Organization
                                    </Button>
                                </div>
                            </div>
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
            </div>

            {/* Create Organization Dialog */}
            <CreateOrganizationDialog
                open={isCreateOrgDialogOpen}
                onOpenChange={setIsCreateOrgDialogOpen}
            />
        </ProtectedRoute>
    )
}
