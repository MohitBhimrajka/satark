'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Mic, Square, Play, RefreshCw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioRecorderProps {
  onCapture: (blob: Blob) => void
}

const MAX_RECORDING_SECONDS = 60

export function AudioRecorder({ onCapture }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopStream()
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
  }, [stopStream, recordedUrl])

  const startRecording = async () => {
    setError(null)
    setRecordedBlob(null)
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setDuration(0)
    chunksRef.current = []

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Microphone is not supported in this browser. Please use Chrome, Firefox, or Edge on HTTPS.'
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedUrl(url)
        stopStream()
      }

      recorder.start(100) // collect data every 100ms
      setIsRecording(true)

      // Timer
      const start = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000)
        setDuration(elapsed)
        if (elapsed >= MAX_RECORDING_SECONDS) {
          stopRecording()
        }
      }, 200)
    } catch {
      setError(
        'Microphone access denied. Please allow microphone permissions and ensure you are on HTTPS.'
      )
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const resetRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null)
    setRecordedUrl(null)
    setDuration(0)
  }

  const useRecording = () => {
    if (recordedBlob) {
      onCapture(recordedBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className='space-y-4'>
      {/* HTTPS Warning */}
      {typeof window !== 'undefined' &&
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' && (
          <div className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
            ⚠ Microphone requires a secure connection (HTTPS).
          </div>
        )}

      {/* Error */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* Initial state */}
      {!isRecording && !recordedBlob && !error && (
        <div className='flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-10'>
          <Mic className='h-8 w-8 text-gray-400' strokeWidth={1.5} />
          <p className='text-sm text-gray-500'>
            Record a suspicious phone call or voice message (max 60s)
          </p>
          <Button variant='outline' size='sm' onClick={startRecording}>
            <Mic className='mr-2 h-4 w-4' strokeWidth={1.5} />
            Start Recording
          </Button>
        </div>
      )}

      {/* Recording state */}
      {isRecording && (
        <div className='flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50/50 px-6 py-8'>
          <div className='flex items-center gap-3'>
            <span className='relative flex h-3 w-3'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75' />
              <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500' />
            </span>
            <span className='font-mono text-lg font-semibold text-red-700'>
              {formatTime(duration)}
            </span>
            <span className='text-xs text-red-500'>
              / {formatTime(MAX_RECORDING_SECONDS)}
            </span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={stopRecording}
            className='border-red-300 text-red-600 hover:bg-red-50'
          >
            <Square className='mr-2 h-4 w-4' strokeWidth={1.5} />
            Stop Recording
          </Button>
        </div>
      )}

      {/* Playback state */}
      {recordedBlob && recordedUrl && (
        <div className='space-y-3'>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <Play className='h-4 w-4 text-gray-500' strokeWidth={1.5} />
              <span className='text-sm font-medium text-gray-700'>
                Recording — {formatTime(duration)}
              </span>
            </div>
            <audio
              controls
              src={recordedUrl}
              className='w-full'
              aria-label='Recorded audio playback'
            />
          </div>
          <div className='flex justify-center gap-2'>
            <Button variant='outline' size='sm' onClick={resetRecording}>
              <RefreshCw className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Re-record
            </Button>
            <Button size='sm' onClick={useRecording}>
              <Check className='mr-2 h-4 w-4' strokeWidth={1.5} />
              Use This Recording
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
