'use client'

import { useState, useEffect } from "react"
import { UserPlus, User, Trash2, Shield, ShieldCheck, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { organizationApi, type OrganizationMember } from "@/lib/api/organizationApi"
import { toast } from "sonner"

interface OrganizationMembersProps {
    organizationId: number;
    organizationName: string;
}

export function OrganizationMembers({ organizationId, organizationName }: OrganizationMembersProps) {
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [addMemberOpen, setAddMemberOpen] = useState(false)
    const [removeMemberConfirm, setRemoveMemberConfirm] = useState<OrganizationMember | null>(null)
    const [addingMember, setAddingMember] = useState(false)
    const [removingMember, setRemovingMember] = useState(false)

    // Form state
    const [username, setUsername] = useState("")
    const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'MODERATOR'>('MEMBER')

    useEffect(() => {
        loadMembers()
    }, [organizationId])

    const loadMembers = async () => {
        try {
            setLoading(true)
            const data = await organizationApi.getOrganizationMembers(organizationId)
            setMembers(data)
        } catch (error: any) {
            console.error('Error loading members:', error)
            toast.error(error.response?.data?.message || 'Failed to load organization members')
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async () => {
        if (!username.trim()) {
            toast.error('Please enter a username')
            return
        }

        try {
            setAddingMember(true)
            await organizationApi.addOrganizationMember(organizationId, {
                username: username.trim(),
                role
            })
            toast.success(`Successfully added ${username} to ${organizationName}`)
            setAddMemberOpen(false)
            setUsername("")
            setRole('MEMBER')
            loadMembers()
        } catch (error: any) {
            console.error('Error adding member:', error)
            toast.error(error.response?.data?.message || error.response?.data?.username?.[0] || 'Failed to add member')
        } finally {
            setAddingMember(false)
        }
    }

    const handleRemoveMember = async (member: OrganizationMember) => {
        try {
            setRemovingMember(true)
            await organizationApi.removeOrganizationMember(organizationId, member.id)
            toast.success(`${member.username} removed from organization`)
            setRemoveMemberConfirm(null)
            loadMembers()
        } catch (error: any) {
            console.error('Error removing member:', error)
            toast.error(error.response?.data?.message || 'Failed to remove member')
        } finally {
            setRemovingMember(false)
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <ShieldCheck className="h-4 w-4" />
            case 'MODERATOR':
                return <Shield className="h-4 w-4" />
            default:
                return <User className="h-4 w-4" />
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
            case 'MODERATOR':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Organization Members
                    </CardTitle>
                    <CardDescription>Manage team members and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                        <span className="ml-2 text-muted-foreground">Loading members...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Organization Members
                            </CardTitle>
                            <CardDescription>
                                {members.length} {members.length === 1 ? 'member' : 'members'} in {organizationName}
                            </CardDescription>
                        </div>
                        <Button onClick={() => setAddMemberOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {members.length > 0 ? (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                            {getRoleIcon(member.role)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium truncate">{member.username}</p>
                                                <Badge className={getRoleBadgeColor(member.role)}>
                                                    {member.role}
                                                </Badge>
                                                {!member.is_active && (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Added {new Date(member.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setRemoveMemberConfirm(member)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No members yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start building your team by adding members
                            </p>
                            <Button onClick={() => setAddMemberOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add First Member
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Member Dialog */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                            Add a new member to {organizationName} by entering their username
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={addingMember}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the exact username of the person you want to add
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={role}
                                onValueChange={(value) => setRole(value as 'ADMIN' | 'MEMBER' | 'MODERATOR')}
                                disabled={addingMember}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>Member - Basic access</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MODERATOR">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <span>Moderator - Can manage content</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="ADMIN">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>Admin - Full access</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddMemberOpen(false)}
                            disabled={addingMember}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMember}
                            disabled={addingMember}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            {addingMember && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Confirmation */}
            <AlertDialog open={!!removeMemberConfirm} onOpenChange={(open) => !open && setRemoveMemberConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{removeMemberConfirm?.username}</strong> from {organizationName}?
                            They will lose access to all organization resources.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removingMember}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => removeMemberConfirm && handleRemoveMember(removeMemberConfirm)}
                            disabled={removingMember}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {removingMember && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
