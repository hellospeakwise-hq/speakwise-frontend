'use client'

import { useState } from "react"
import { Building2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { OrganizationMembers } from "./organization-members"
import { type Organization } from "@/lib/api/organizationApi"

interface OrganizationMembersManagerProps {
    organizations: Organization[];
}

export function OrganizationMembersManager({ organizations }: OrganizationMembersManagerProps) {
    const [selectedOrgId, setSelectedOrgId] = useState<number>(organizations[0]?.id || 0)

    const selectedOrg = organizations.find(org => org.id === selectedOrgId)

    return (
        <div className="space-y-4">
            {/* Organization Selector */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                <Building2 className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                    <Label htmlFor="org-select" className="text-sm font-medium mb-2 block">
                        Select Organization
                    </Label>
                    <Select
                        value={selectedOrgId.toString()}
                        onValueChange={(value) => setSelectedOrgId(parseInt(value))}
                    >
                        <SelectTrigger id="org-select" className="w-full max-w-md">
                            <SelectValue placeholder="Choose an organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{org.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({org.members?.length || 0} members)
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Members Management for Selected Organization */}
            {selectedOrg && (
                <OrganizationMembers
                    key={selectedOrgId}
                    organizationId={selectedOrg.id}
                    organizationName={selectedOrg.name}
                />
            )}
        </div>
    )
}
