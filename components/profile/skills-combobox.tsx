"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { speakerApi, SkillTag } from "@/lib/api/speakerApi"

interface SkillsComboboxProps {
  selectedSkills: SkillTag[]
  onSkillAdd: (skill: SkillTag) => void | Promise<void>
  onCreateSkill: (name: string) => Promise<SkillTag | null>
}

export function SkillsCombobox({ selectedSkills, onSkillAdd, onCreateSkill }: Readonly<SkillsComboboxProps>) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [allSkills, setAllSkills] = React.useState<SkillTag[]>([])
  const [loading, setLoading] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  // Load all available skills on mount
  React.useEffect(() => {
    const loadAllSkills = async () => {
      setLoading(true)
      try {
        // Use getSkills() - the skill-tags endpoint no longer exists
        const skills = await speakerApi.getSkills()
        setAllSkills(skills)
      } catch (error) {
        console.error("Failed to load skills:", error)
        setAllSkills([])
      } finally {
        setLoading(false)
      }
    }
    loadAllSkills()
  }, [])

  // Filter skills based on search and exclude already selected
  const filteredSkills = React.useMemo(() => {
    const selectedIds = new Set(selectedSkills.map(s => s.id))
    return allSkills.filter(skill => {
      // Exclude already selected skills
      if (selectedIds.has(skill.id)) return false
      // Filter by search term
      if (searchValue) {
        return skill.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      return true
    })
  }, [allSkills, selectedSkills, searchValue])

  // Check if the search term matches any existing skill exactly
  const exactMatch = React.useMemo(() => {
    if (!searchValue.trim()) return null
    return allSkills.find(
      skill => skill.name.toLowerCase() === searchValue.toLowerCase()
    )
  }, [allSkills, searchValue])

  // Check if skill is already selected
  const isAlreadySelected = React.useMemo(() => {
    if (!searchValue.trim()) return false
    return selectedSkills.some(
      skill => skill.name.toLowerCase() === searchValue.toLowerCase()
    )
  }, [selectedSkills, searchValue])

  const handleSelect = (skill: SkillTag) => {
    onSkillAdd(skill)
    setSearchValue("")
    setOpen(false)
  }

  const handleCreateNew = async () => {
    if (!searchValue.trim() || isAlreadySelected) return
    
    setCreating(true)
    try {
      const newSkill = await onCreateSkill(searchValue.trim())
      if (newSkill) {
        // Add to local list so it appears in future searches
        setAllSkills(prev => [...prev, newSkill])
        setSearchValue("")
        setOpen(false)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="text-muted-foreground">
            Search or add a skill...
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type a skill (e.g., React, Leadership)..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading skills...</span>
              </div>
            ) : (
              <>
                {/* Show option to create new skill if no exact match and not already selected */}
                {searchValue.trim() && !exactMatch && !isAlreadySelected && (
                  <CommandGroup heading="Create New">
                    <CommandItem
                      onSelect={handleCreateNew}
                      className="cursor-pointer"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      <span>Create &quot;{searchValue.trim()}&quot;</span>
                    </CommandItem>
                  </CommandGroup>
                )}

                {/* Show message if search term is already selected */}
                {isAlreadySelected && (
                  <div className="py-3 px-2 text-sm text-muted-foreground text-center">
                    &quot;{searchValue}&quot; is already added to your skills
                  </div>
                )}

                {/* Show filtered existing skills */}
                {filteredSkills.length > 0 && (
                  <CommandGroup heading="Available Skills">
                    {filteredSkills.slice(0, 10).map((skill) => (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => handleSelect(skill)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSkills.some(s => s.id === skill.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {skill.name}
                      </CommandItem>
                    ))}
                    {filteredSkills.length > 10 && (
                      <div className="py-2 px-2 text-xs text-muted-foreground text-center">
                        Type to search {filteredSkills.length - 10} more skills...
                      </div>
                    )}
                  </CommandGroup>
                )}

                {/* Empty state */}
                {!searchValue && filteredSkills.length === 0 && !loading && (
                  <CommandEmpty>
                    Start typing to search or create skills
                  </CommandEmpty>
                )}

                {searchValue && filteredSkills.length === 0 && !isAlreadySelected && exactMatch && (
                  <div className="py-3 px-2 text-sm text-muted-foreground text-center">
                    Click to add &quot;{exactMatch.name}&quot;
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
