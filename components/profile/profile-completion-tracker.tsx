"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ChevronDown, ChevronUp, User, Building2, FileText, MapPin, Image, Tags, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateProfileCompletion } from "@/lib/utils/profile-completion"

interface ProfileCompletionItem {
    id: string
    label: string
    isComplete: boolean
    priority: 'required' | 'recommended' | 'optional'
    icon: React.ReactNode
}

const ICONS: Record<string, React.ReactNode> = {
    avatar: <Image className="h-3 w-3" />,
    name: <User className="h-3 w-3" />,
    username: <User className="h-3 w-3" />,
    organization: <Building2 className="h-3 w-3" />,
    short_bio: <FileText className="h-3 w-3" />,
    long_bio: <FileText className="h-3 w-3" />,
    country: <MapPin className="h-3 w-3" />,
    skill_tags: <Tags className="h-3 w-3" />,
    experiences: <Mic className="h-3 w-3" />,
}

interface ProfileCompletionTrackerProps {
    profileData: {
        user: {
            first_name?: string
            last_name?: string
            username?: string
            nationality?: string
            email?: string
        }
        speaker?: {
            organization?: string
            short_bio?: string
            long_bio?: string
            country?: string
            avatar?: string
            skill_tags?: any[]
            experiences?: any[]
        } | null
    }
    onEditClick?: () => void
}

// Circular Progress Component - Compact version
function CircularProgress({ percentage, size = 60, strokeWidth = 5 }: { percentage: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference
    
    const getColor = () => {
        if (percentage === 100) return 'text-green-500'
        if (percentage >= 70) return 'text-blue-500'
        if (percentage >= 40) return 'text-yellow-500'
        return 'text-orange-500'
    }

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-muted/20"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className={cn("transition-all duration-500 ease-out", getColor())}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-sm font-bold", getColor())}>{percentage}%</span>
            </div>
        </div>
    )
}

export function ProfileCompletionTracker({ profileData, onEditClick }: ProfileCompletionTrackerProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { user, speaker } = profileData

    const { fields, completedCount, totalCount, percentage: completionPercentage } = calculateProfileCompletion({ user, speaker })

    const completionItems: ProfileCompletionItem[] = fields.map(field => ({
        ...field,
        icon: ICONS[field.id]
    }))

    return (
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            {/* Collapsed Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
                <CircularProgress percentage={completionPercentage} size={50} strokeWidth={4} />
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                        {completionPercentage === 100 ? "🎉 Complete!" : "Profile Completion"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {completedCount}/{totalCount} items
                    </p>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t">
                    <div className="pt-2 space-y-1">
                        {completionItems.map(item => (
                            <div 
                                key={item.id}
                                className={cn(
                                    "flex items-center gap-2 text-xs py-1 px-2 rounded",
                                    item.isComplete 
                                        ? "text-muted-foreground" 
                                        : "bg-muted/50"
                                )}
                            >
                                {item.isComplete ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                ) : (
                                    <Circle className={cn(
                                        "h-3 w-3 flex-shrink-0",
                                        item.priority === 'required' ? "text-red-400" :
                                        item.priority === 'recommended' ? "text-yellow-400" : "text-muted-foreground"
                                    )} />
                                )}
                                <span className="flex items-center gap-1">
                                    {item.icon}
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {completionPercentage < 100 && onEditClick && (
                        <button
                            onClick={onEditClick}
                            className="w-full py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded hover:bg-primary/90 transition-colors"
                        >
                            Complete Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
