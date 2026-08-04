"use client"

import { useEffect, useRef, useState } from "react"
import { FileUp, Trash2, FileText, Loader2, Upload, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea"
import { speakerApi, type SpeakerDeck } from "@/lib/api/speakerApi"
import { type Event } from "@/lib/types/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const ALLOWED_EXTENSIONS = [".pdf", ".ppt", ".pptx", ".key", ".odp", ".zip"]
const MAX_SIZE_MB = 50

interface UploadDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (deck: SpeakerDeck) => void
}

function UploadDialog({ event, open, onOpenChange, onUploaded }: UploadDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  function validateFile(f: File): string | null {
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type not allowed. Use: ${ALLOWED_EXTENSIONS.join(", ")}`
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  function handleFile(f: File) {
    const err = validateFile(f)
    setFileError(err)
    if (!err) setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const deck = await speakerApi.uploadDeck(event.id, file, description)
      onUploaded(deck)
      toast.success("Presentation uploaded successfully")
      onOpenChange(false)
      setFile(null)
      setDescription("")
    } catch (err: any) {
      toast.error(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function formatBytes(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Presentation</DialogTitle>
          <DialogDescription>
            Upload your deck for <span className="font-medium text-foreground">{event.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop zone for presentation file"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragging
                ? "border-foreground bg-muted/50"
                : "border-muted-foreground/25 hover:border-foreground/40 hover:bg-muted/40"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(null) }}
                >
                  Choose different file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  {ALLOWED_EXTENSIONS.join(", ")} · max {MAX_SIZE_MB} MB
                </p>
              </div>
            )}
          </div>

          {fileError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {fileError}
            </div>
          )}

          {/* Optional description */}
          <Textarea
            placeholder="Optional description (e.g. 'Keynote slides — React Summit 2025')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !!fileError || uploading}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
              ) : (
                <><FileUp className="h-4 w-4 mr-2" /> Upload</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SpeakerDecksProps {
  events: Event[]
}

export function SpeakerDecks({ events }: SpeakerDecksProps) {
  const [decksByEvent, setDecksByEvent] = useState<Record<string, SpeakerDeck[]>>({})
  const [loading, setLoading] = useState(true)
  const [uploadTarget, setUploadTarget] = useState<Event | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ deck: SpeakerDeck; eventTitle: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const uploadEnabledEvents = events.filter((e) => e.speaker_deck_upload_enabled)

  useEffect(() => {
    if (uploadEnabledEvents.length === 0) {
      setLoading(false)
      return
    }
    Promise.all(
      uploadEnabledEvents.map((e) =>
        speakerApi.getDecks(e.id).then((decks) => ({ id: e.id, decks }))
      )
    )
      .then((results) => {
        const map: Record<string, SpeakerDeck[]> = {}
        results.forEach(({ id, decks }) => { map[id] = decks })
        setDecksByEvent(map)
      })
      .catch(() => toast.error("Could not load decks"))
      .finally(() => setLoading(false))
  }, [events])

  function handleUploaded(eventId: string, deck: SpeakerDeck) {
    setDecksByEvent((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] ?? []), deck],
    }))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await speakerApi.deleteDeck(deleteTarget.deck.id)
      setDecksByEvent((prev) => ({
        ...prev,
        [deleteTarget.deck.event!]: prev[deleteTarget.deck.event!]?.filter(
          (d) => d.id !== deleteTarget.deck.id
        ) ?? [],
      }))
      toast.success("Deck removed")
    } catch {
      toast.error("Could not delete deck")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  function formatBytes(bytes: number | null) {
    if (!bytes) return ""
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Presentations</CardTitle>
          <CardDescription>Decks you&apos;ve uploaded for your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="ml-2 text-muted-foreground text-sm">Loading presentations…</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (uploadEnabledEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Presentations</CardTitle>
          <CardDescription>Decks you&apos;ve uploaded for your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No uploads available yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Deck uploads open when an organizer enables them for your confirmed event.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {uploadEnabledEvents.map((event) => {
          const decks = decksByEvent[event.id] ?? []
          return (
            <Card key={event.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      Upload open
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {decks.length} {decks.length === 1 ? "file" : "files"} uploaded
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setUploadTarget(event)}
                  className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                >
                  <FileUp className="h-4 w-4 mr-1.5" />
                  Upload deck
                </Button>
              </CardHeader>

              <CardContent>
                {decks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No decks uploaded yet.</p>
                ) : (
                  <ul className="divide-y">
                    {decks.map((deck) => (
                      <li key={deck.id} className="flex items-center justify-between py-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-orange-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {deck.original_filename ?? "Unnamed file"}
                            </p>
                            {deck.description && (
                              <p className="text-xs text-muted-foreground truncate">{deck.description}</p>
                            )}
                            {deck.file_size && (
                              <p className="text-xs text-muted-foreground">{formatBytes(deck.file_size)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={deck.file?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${deck.file}` : deck.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 hover:underline"
                          >
                            View
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ deck, eventTitle: event.title })}
                            aria-label="Delete deck"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {uploadTarget && (
        <UploadDialog
          event={uploadTarget}
          open={!!uploadTarget}
          onOpenChange={(open) => { if (!open) setUploadTarget(null) }}
          onUploaded={(deck) => handleUploaded(uploadTarget.id, deck)}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{deleteTarget?.deck.original_filename}</span> will be permanently removed from{" "}
              <span className="font-medium">{deleteTarget?.eventTitle}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
