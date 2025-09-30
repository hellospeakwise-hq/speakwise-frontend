"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { RoleGuard } from "@/components/auth/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { speakerApi, SpeakerProfile, SkillTag } from "@/lib/api/speakerApi"
import { Upload, X } from "lucide-react"

export default function ProfilePage() {
    const { user, setUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [speakerProfile, setSpeakerProfile] = useState<SpeakerProfile | null>(null)
    const [skillTags, setSkillTags] = useState<SkillTag[]>([])
    const [availableSkills, setAvailableSkills] = useState<SkillTag[]>([])
    const [newSkillName, setNewSkillName] = useState("")
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)

    // Form state - initialize with empty strings
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [organization, setOrganization] = useState("")
    const [shortBio, setShortBio] = useState("")
    const [longBio, setLongBio] = useState("")
    const [country, setCountry] = useState("")

    // Sync form state with user data
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '')
            setLastName(user.last_name || '')
            setEmail(user.email || '')
        }
    }, [user])

    // Load speaker profile and skill tags
    useEffect(() => {
        if (user?.userType === 'speaker') {
            loadSkillTags().then(() => {
                loadSpeakerProfile()
            })
        }
    }, [user])

    // Update skill tags when both speaker profile and available skills are loaded
    useEffect(() => {
        if (speakerProfile && availableSkills.length > 0 && speakerProfile.skill_tags) {
            const currentSkills = availableSkills.filter(skill => 
                speakerProfile.skill_tags.includes(skill.id)
            )
            setSkillTags(currentSkills)
        }
    }, [speakerProfile, availableSkills])

    const loadSpeakerProfile = async () => {
        try {
            setIsLoadingProfile(true)
            const profile = await speakerApi.getProfile()
            setSpeakerProfile(profile)
            setOrganization(profile.organization || "")
            setShortBio(profile.short_bio || "")
            setLongBio(profile.long_bio || "")
            setCountry(profile.country || "")
        } catch (error) {
            console.error('Failed to load speaker profile:', error)
            toast.error("Failed to load speaker profile")
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const loadSkillTags = async () => {
        try {
            const tags = await speakerApi.getSkillTags()
            setAvailableSkills(tags)
        } catch (error) {
            console.error('Failed to load skill tags:', error)
        }
    }

    const handleSaveProfile = async () => {
        try {
            // Only update speaker-specific information if user is a speaker
            if (user?.userType === 'speaker') {
                const speakerUpdateData = {
                    organization,
                    short_bio: shortBio,
                    long_bio: longBio,
                    country,
                    skill_tags: skillTags.map(tag => tag.id)
                }
                const updatedProfile = await speakerApi.updateProfile(speakerUpdateData)
                setSpeakerProfile(updatedProfile)
                toast.success("Profile updated successfully")
            } else {
                toast.success("Profile updated successfully")
            }
            
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error("Failed to update profile")
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || user?.userType !== 'speaker') return

        try {
            const updatedProfile = await speakerApi.uploadAvatar(file)
            setSpeakerProfile(updatedProfile)
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
            setAvailableSkills(prev => [...prev, newTag])
            setSkillTags(prev => [...prev, newTag])
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

    return (
        <ProtectedRoute>
            <div className="container py-10">
                <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your basic account information (read-only)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            disabled
                                            placeholder={user?.first_name ? "" : "Not provided"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            disabled
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">User Role</Label>
                                    <Input
                                        id="role"
                                        value={user?.userType || 'User'}
                                        disabled
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    {isEditing ? (
                                        <>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button onClick={handleSaveProfile}>Save Changes</Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Speaker-specific profile sections */}
                    {user?.userType === 'speaker' && (
                        <>
                            {/* Avatar Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Picture</CardTitle>
                                    <CardDescription>Upload your profile picture</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-4">
                                        {speakerProfile?.avatar && (
                                            <div className="relative">
                                                <img
                                                    src={speakerProfile.avatar.startsWith('http') 
                                                        ? speakerProfile.avatar 
                                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${speakerProfile.avatar}`
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
                                            />
                                            <label htmlFor="avatar-upload">
                                                <Button variant="outline" className="cursor-pointer" asChild>
                                                    <span>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {speakerProfile?.avatar ? 'Change Picture' : 'Upload Picture'}
                                                    </span>
                                                </Button>
                                            </label>
                                            {speakerProfile?.avatar && (
                                                <p className="text-xs text-muted-foreground">
                                                    Current image: {speakerProfile.avatar.split('/').pop()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Speaker Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Speaker Details</CardTitle>
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
                                                        onKeyPress={(e) => e.key === 'Enter' && addSkillTag()}
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
                        </>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Update your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">Change Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
