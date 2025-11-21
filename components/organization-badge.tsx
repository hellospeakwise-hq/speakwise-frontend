'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { organizationApi, type Organization } from '@/lib/api/organizationApi';
import { cn } from '@/lib/utils';

export function OrganizationBadge() {
    const [approvedOrganizations, setApprovedOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrganizations = async () => {
            try {
                setLoading(true);
                const orgs = await organizationApi.getUserOrganizations();
                const approved = orgs.filter(org => org.is_active === true);
                setApprovedOrganizations(approved);
            } catch (error) {
                console.error('Error loading organizations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrganizations();
    }, []);

    if (loading || approvedOrganizations.length === 0) {
        return null;
    }

    return (
        <Link href="/organizations">
            <Badge
                variant="secondary"
                className={cn(
                    "gap-1.5 px-3 py-1.5 cursor-pointer transition-all hover:scale-105",
                    "bg-orange-500 hover:bg-orange-600 text-white border-0"
                )}
            >
                <Building2 className="h-3.5 w-3.5" />
                <span className="font-medium">
                    {approvedOrganizations.length} {approvedOrganizations.length === 1 ? 'Org' : 'Orgs'}
                </span>
            </Badge>
        </Link>
    );
}
