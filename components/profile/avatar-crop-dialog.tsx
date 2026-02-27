'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Given the original image and the pixel-perfect crop area returned by
 * react-easy-crop, draw the cropped region onto an off-screen canvas and
 * return it as a Blob so we can upload it directly.
 */
async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  // Rotate around centre
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2)

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y),
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.92,
    )
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

// ─── component ────────────────────────────────────────────────────────────────

interface AvatarCropDialogProps {
  /** The raw local object URL of the file the user picked */
  imageSrc: string | null
  open: boolean
  onClose: () => void
  /** Called with the cropped Blob so the parent can upload it */
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void
}

export function AvatarCropDialog({
  imageSrc,
  open,
  onClose,
  onCropComplete,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation)
      const previewUrl = URL.createObjectURL(blob)
      onCropComplete(blob, previewUrl)
      onClose()
    } catch {
      // swallow — parent will show error if upload fails
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    // Reset state so next open starts fresh
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    onClose()
  }

  if (!imageSrc) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-[#0d1117] border border-[#30363d]">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-white text-lg font-semibold">
            Crop Your Photo
          </DialogTitle>
        </DialogHeader>

        {/* ── Crop area ── */}
        <div className="relative w-full" style={{ height: 340 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            style={{
              containerStyle: { background: '#080c10' },
              cropAreaStyle: {
                border: '2px solid #f97316',
                boxShadow: '0 0 0 9999em rgba(0,0,0,0.65)',
              },
            }}
          />
        </div>

        {/* ── Controls ── */}
        <div className="px-6 py-4 space-y-4 bg-[#0d1117]">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <RotateCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={([v]) => setRotation(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {rotation}°
            </span>
          </div>
        </div>

        <DialogFooter className="px-6 pb-5 gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#30363d] text-white hover:bg-[#21262d]"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isProcessing}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? 'Applying…' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
