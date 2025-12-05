"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, Upload, Save, Edit, User, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { speakerApi, SpeakerProfile, SkillTag } from "@/lib/api/speakerApi"
import { AddExperienceDialog } from "@/components/speakers/add-experience-dialog"
import { ExperiencesList } from "@/components/speakers/experiences-list"

export default function SpeakerProfilePage() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Profile state
    const [profile, setProfile] = useState<SpeakerProfile | null>(null)
    const [availableSkills, setAvailableSkills] = useState<SkillTag[]>([])
    const [newSkillName, setNewSkillName] = useState("")

    // Form state
    const [organization, setOrganization] = useState("")
    const [shortBio, setShortBio] = useState("")
    const [longBio, setLongBio] = useState("")
    const [country, setCountry] = useState("")
    const [selectedSkills, setSelectedSkills] = useState<number[]>([])

    // Load speaker profile and skills on mount
    useEffect(() => {
        loadProfileData()
    }, [])

    const loadProfileData = async () => {
        try {
            setLoading(true)
            const [profileData, skillsData] = await Promise.all([
                speakerApi.getProfile(),
                speakerApi.getSkillTags()
            ])

            setProfile(profileData)
            setAvailableSkills(skillsData)

            // Set form values
            setOrganization(profileData.organization || "")
            setShortBio(profileData.short_bio || "")
            setLongBio(profileData.long_bio || "")
            setCountry(profileData.country || "")
            setSelectedSkills(profileData.skill_tags || [])
        } catch (error) {
            console.error("Error loading profile:", error)
            toast.error("Failed to load profile data")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        try {
            setSaving(true)
            const updatedProfile = await speakerApi.updateProfile({
                organization,
                short_bio: shortBio,
                long_bio: longBio,
                country,
                skill_tags: selectedSkills
            })

            setProfile(updatedProfile)
            setIsEditing(false)
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Error saving profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const updatedProfile = await speakerApi.uploadAvatar(file)
            setProfile(updatedProfile)
            toast.success("Avatar uploaded successfully")
        } catch (error) {
            console.error("Error uploading avatar:", error)
            toast.error("Failed to upload avatar")
        } finally {
            setUploading(false)
        }
    }

    const handleAddSkill = async () => {
        if (!newSkillName.trim()) return

        try {
            const newSkill = await speakerApi.createSkillTag(newSkillName.trim())
            setAvailableSkills([...availableSkills, newSkill])
            setSelectedSkills([...selectedSkills, newSkill.id])
            setNewSkillName("")
            toast.success("Skill added successfully")
        } catch (error) {
            console.error("Error creating skill:", error)
            toast.error("Failed to add skill")
        }
    }

    const toggleSkill = (skillId: number) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        )
    }

    const removeSkill = (skillId: number) => {
        setSelectedSkills(prev => prev.filter(id => id !== skillId))
    }

    if (loading) {
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
                        <h1 className="text-3xl font-bold tracking-tight">Speaker Profile</h1>
                        <p className="text-muted-foreground">Manage your speaker profile information</p>
                    </div>

                    {/* Profile Header with Avatar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your basic profile details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage
                                            src={profile?.avatar}
                                            alt={user?.first_name || "Speaker"}
                                        />
                                        <AvatarFallback>
                                            <User className="w-12 h-12" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            disabled={uploading}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading ? "Uploading..." : "Upload Photo"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>First Name</Label>
                                            <Input value={user?.first_name || ""} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <Input value={user?.last_name || ""} disabled />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={user?.email || ""} disabled />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Professional Information</CardTitle>
                                <CardDescription>Your professional details and bio</CardDescription>
                            </div>
                            <Button
                                variant={isEditing ? "outline" : "default"}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                {isEditing ? "Cancel" : "Edit"}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                    placeholder="A brief description of yourself"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longBio">Long Bio</Label>
                                <Textarea
                                    id="longBio"
                                    value={longBio}
                                    onChange={(e) => setLongBio(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Tell your story in detail..."
                                    rows={6}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Skills Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                            <CardDescription>Add tags for your areas of expertise</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selected Skills */}
                            {selectedSkills.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Your Skills</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.map(skillId => {
                                            const skill = availableSkills.find(s => s.id === skillId)
                                            return skill ? (
                                                <Badge key={skill.id} variant="default" className="flex items-center gap-1">
                                                    {skill.name}
                                                    <button
                                                        onClick={() => removeSkill(skill.id)}
                                                        className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ) : null
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Add New Skill */}
                            <div className="space-y-2">
                                <Label>Add Skill</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        placeholder="Enter a new skill"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    />
                                    <Button onClick={handleAddSkill} disabled={!newSkillName.trim()}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Available Skills */}
                            {availableSkills.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Available Skills (click to add/remove)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSkills
                                            .filter(skill => !selectedSkills.includes(skill.id))
                                            .map(skill => (
                                                <Badge
                                                    key={skill.id}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                    onClick={() => toggleSkill(skill.id)}
                                                >
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Speaking Experiences */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Speaking Experiences
                                </CardTitle>
                                <CardDescription>Your conference talks and presentations</CardDescription>
                            </div>
                            <AddExperienceDialog onSuccess={loadProfileData} />
                        </CardHeader>
                        <CardContent>
                            {profile?.id && <ExperiencesList speakerId={profile.id} />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
