'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  const startCamera = async () => {
    setError(null)
    setCapturedImage(null)
    setCapturedBlob(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera is not supported in this browser. Please use Chrome, Firefox, or Edge on HTTPS.'
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsStreaming(true)
    } catch {
      setError(
        'Camera access denied. Please allow camera permissions and ensure you are on HTTPS.'
      )
    }
  }

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(canvas.toDataURL('image/png'))
          setCapturedBlob(blob)
          stopStream()
        }
      },
      'image/png',
      0.9
    )
  }

  const retake = () => {
    setCapturedImage(null)
    setCapturedBlob(null)
    startCamera()
  }

  const usePhoto = () => {
    if (capturedBlob) {
      onCapture(capturedBlob)
    }
  }

  return (
    <div className='space-y-4'>
      {/* HTTPS Warning */}
      {typeof window !== 'undefined' &&
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' && (
          <div className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
            ⚠ Camera requires a secure connection (HTTPS).
          </div>
        )}

      {/* Error state */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* Initial state — start button */}
      {!isStreaming && !capturedImage && !error && (
        <div className='flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-10'>
          <Camera className='h-8 w-8 text-gray-400' strokeWidth={1.5} />
          <p className='text-sm text-gray-500'>
            Capture a photo of a suspicious screen or document
          </p>
          <Button variant='outline' size='sm' onClick={startCamera}>
            <Camera className='mr-2 h-4 w-4' strokeWidth={1.5} />
            Open Camera
          </Button>
        </div>
      )}

      {/* Live preview */}
      {isStreaming && (
        <div className='space-y-3'>
          <div className='overflow-hidden rounded-lg border border-gray-200'>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='w-full'
            />
          </div>
          <div className='flex justify-center gap-2'>
            <Button variant='outline' size='sm' onClick={stopStream}>
              <X className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Cancel
            </Button>
            <Button size='sm' onClick={capture}>
              <Camera className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Capture
            </Button>
          </div>
        </div>
      )}

      {/* Captured preview */}
      {capturedImage && (
        <div className='space-y-3'>
          <div className='overflow-hidden rounded-lg border border-gray-200'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt='Captured screenshot'
              className='w-full'
            />
          </div>
          <div className='flex justify-center gap-2'>
            <Button variant='outline' size='sm' onClick={retake}>
              <RefreshCw className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Retake
            </Button>
            <Button size='sm' onClick={usePhoto}>
              <Check className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Use This Photo
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className='hidden' />
    </div>
  )
}
