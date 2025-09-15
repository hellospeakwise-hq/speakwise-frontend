"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Upload, X, Plus } from "lucide-react"
import { eventsAPI, type Event, type CreateEventData, type Country, type Tag } from "@/lib/api/eventsApi"

const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  event_nickname: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  start_date_time: z.string().min(1, "Start date and time are required"),
  end_date_time: z.string().min(1, "End date and time are required"),
  is_active: z.boolean().default(false),
  country: z.number().optional(),
  tags: z.array(z.number()).optional(),
})

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
  onEventSaved: (event: Event) => void
}

export function EventFormDialog({ 
  open, 
  onOpenChange, 
  event = null, 
  onEventSaved 
}: EventFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    event?.event_image || null
  )
  const [countries, setCountries] = useState<Country[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>(
    event?.tags?.map(tag => tag.id) || []
  )
  const [newTagName, setNewTagName] = useState("")
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  // Load countries and tags on component mount or when dialog opens
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading countries and tags data...');
        const [countriesData, tagsData] = await Promise.all([
          eventsAPI.getCountries(),
          eventsAPI.getTags()
        ]);
        console.log('Countries loaded:', countriesData);
        console.log('Tags loaded:', tagsData);
        setCountries(countriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading countries and tags:', error);
      }
    };
    
    if (open) {
      loadData();
    }
  }, [open]);

  // Update selected tags when event changes
  useEffect(() => {
    if (event?.tags) {
      console.log('Event tags detected:', event.tags);
      setSelectedTags(event.tags.map(tag => tag.id));
      setImagePreview(event.event_image || null);
    } else {
      console.log('No event tags detected');
      setSelectedTags([]);
    }
  }, [event])

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      event_nickname: event?.event_nickname || "",
      short_description: event?.short_description || "",
      description: event?.description || "",
      website: event?.website || "",
      location: event?.location || "",
      start_date_time: event?.start_date_time 
        ? new Date(event.start_date_time).toISOString().slice(0, 16) 
        : "",
      end_date_time: event?.end_date_time 
        ? new Date(event.end_date_time).toISOString().slice(0, 16) 
        : "",
      is_active: event?.is_active || false,
      country: event?.country?.id || undefined,
      tags: event?.tags?.map(tag => tag.id) || [],
    },
  })

  // Reset form when event data changes
  useEffect(() => {
    if (open && event) {
      console.log('Event data changed, resetting form:', event);
      form.reset({
        title: event.title || "",
        event_nickname: event.event_nickname || "",
        short_description: event.short_description || "",
        description: event.description || "",
        website: event.website || "",
        location: event.location || "",
        start_date_time: event.start_date_time 
          ? new Date(event.start_date_time).toISOString().slice(0, 16) 
          : "",
        end_date_time: event.end_date_time 
          ? new Date(event.end_date_time).toISOString().slice(0, 16) 
          : "",
        is_active: event.is_active || false,
        country: event.country?.id || undefined,
        tags: event.tags?.map(tag => tag.id) || [],
      });
      
      // Also update image preview if there's an event image
      setImagePreview(event.event_image || null);
    }
  }, [event, open, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      })

      // Validate file type more strictly
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validImageTypes.includes(file.type.toLowerCase())) {
        alert(`Please select a valid image file. Selected type: ${file.type}`)
        e.target.value = '' // Clear the input
        return
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert(`Image file size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        e.target.value = '' // Clear the input
        return
      }

      // Additional validation: try to load the image to ensure it's valid
      const isValid = await validateImageFile(file)
      if (!isValid) {
        alert('The selected file appears to be corrupted or is not a valid image.')
        e.target.value = '' // Clear the input
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper function to validate image file
  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        console.log('Image validation successful:', file.name, `${img.width}x${img.height}`)
        resolve(true)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        console.error('Image validation failed:', file.name)
        resolve(false)
      }
      
      img.src = objectUrl
      
      // Timeout after 5 seconds
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
        console.error('Image validation timeout:', file.name)
        resolve(false)
      }, 5000)
    })
  }

  // Add tag to selected tags
  const addTag = (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      console.log('Adding tag:', tagId);
      const newTags = [...selectedTags, tagId];
      setSelectedTags(newTags);
      
      // Explicitly update the form value
      form.setValue('tags', newTags, { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true 
      });
      console.log('Updated form tags:', form.getValues('tags'));
    }
  }

  // Remove tag from selected tags
  const removeTag = (tagId: number) => {
    console.log('Removing tag:', tagId);
    const newTags = selectedTags.filter(id => id !== tagId);
    setSelectedTags(newTags);
    
    // Explicitly update the form value with options
    form.setValue('tags', newTags, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
    console.log('Updated form tags after removal:', form.getValues('tags'));
  }

  // Create new tag
  const createNewTag = async () => {
    if (!newTagName.trim()) return

    setIsCreatingTag(true)
    try {
      // Generate a random color for the tag
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      const newTag = await eventsAPI.createTag(newTagName.trim(), randomColor)
      console.log('New tag created:', newTag)
      setTags(prev => [...prev, newTag])
      addTag(newTag.id)
      setNewTagName("")
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Failed to create tag. Please try again.')
    } finally {
      setIsCreatingTag(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    setIsLoading(true)
    try {
      // Make sure tags is properly formatted as an array of numbers
      const tagsArray = selectedTags.length > 0 ? selectedTags : [];
      console.log('Tags array for submission:', tagsArray);
      
      // Get the latest form values
      const formValues = form.getValues();
      console.log('Form values before submission:', formValues);
      
      const eventData: CreateEventData = {
        ...values,
        event_image: selectedImage,
        tags: tagsArray, // Use the state instead of form values for tags
      }

      console.log('Submitting event data:', eventData)
      console.log('Selected image:', selectedImage)
      console.log('Selected tags:', selectedTags)
      
      // Additional debugging for image
      if (selectedImage) {
        console.log('Image file details before submission:', {
          name: selectedImage.name,
          type: selectedImage.type,
          size: selectedImage.size,
          lastModified: new Date(selectedImage.lastModified).toISOString()
        })
        
        // Try to read a small portion of the file to verify it's not corrupted
        const reader = new FileReader()
        const slice = selectedImage.slice(0, 100) // Read first 100 bytes
        reader.readAsArrayBuffer(slice)
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer
          const bytes = new Uint8Array(buffer)
          console.log('First few bytes of file:', Array.from(bytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '))
        }
      }

      let savedEvent: Event
      if (event) {
        // Update existing event
        savedEvent = await eventsAPI.updateEvent(event.id, eventData)
      } else {
        // Create new event
        savedEvent = await eventsAPI.createEvent(eventData)
      }

      onEventSaved(savedEvent)
      onOpenChange(false)
      form.reset()
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedTags([])
      setNewTagName("")
    } catch (error) {
      console.error('Error saving event:', error)
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('400') && error.message.includes('event_image')) {
          // Specific image error handling
          alert(`Image upload failed: The image format may not be supported by the server. Please try a different image file or contact support.`)
        } else {
          alert(`Error saving event: ${error.message}`)
        }
      } else {
        alert('An unknown error occurred while saving the event.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? "Update the event details below." 
              : "Fill in the details to create a new event."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Event Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Image</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
                {imagePreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nickname */}
            <FormField
              control={form.control}
              name="event_nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="Short name or acronym" {...field} />
                  </FormControl>
                  <FormDescription>
                    A shorter name for the event (e.g., "TechConf 2025")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short Description */}
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description for event cards"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description shown on event cards (recommended: 150 characters or less)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed event description"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description shown on the event page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      type="url" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location or venue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The country where the event will be hosted
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Tags</label>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    if (!tag) {
                      console.log('Tag not found:', tagId, 'Available tags:', tags);
                      // Create a placeholder tag instead of returning null
                      return (
                        <Badge
                          key={tagId}
                          variant="secondary"
                          className="flex items-center gap-1"
                          style={{ backgroundColor: '#f0f0f0', color: '#666', borderColor: '#ccc' }}
                        >
                          {`Tag ${tagId}`}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tagId)}
                          />
                        </Badge>
                      );
                    }
                    return (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="flex items-center gap-1"
                        style={{ 
                          backgroundColor: `${tag.color || '#007bff'}20`, 
                          color: tag.color || '#007bff', 
                          borderColor: tag.color || '#007bff' 
                        }}
                      >
                        {tag.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tagId)}
                        />
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Tag Selection */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select onValueChange={(value) => addTag(parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.filter(tag => !selectedTags.includes(tag.id)).map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create New Tag */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Create new tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={createNewTag}
                    disabled={!newTagName.trim() || isCreatingTag}
                  >
                    {isCreatingTag ? (
                      "Creating..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Tags help categorize and filter events
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time *</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Published</FormLabel>
                    <FormDescription>
                      Make this event visible to attendees
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
