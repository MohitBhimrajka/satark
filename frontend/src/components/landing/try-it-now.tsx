'use client'

import { useState } from 'react'
import { Link2, MessageSquare, Image, Mic, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResultCard } from '@/components/analysis/result-card'
import { CameraCapture } from '@/components/media/camera-capture'
import { AudioRecorder } from '@/components/media/audio-recorder'
import api from '@/lib/api-client'
import type { ThreatAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import demoSamples from '@/data/demo-samples.json'

const TABS = [
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'text', label: 'Text', icon: MessageSquare },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'file', label: 'File', icon: FileText },
] as const

type TabId = (typeof TABS)[number]['id']

interface QuickScanResult {
  analysis: ThreatAnalysis
  analyzed_at: string
}

export function TryItNow() {
  const [activeTab, setActiveTab] = useState<TabId>('url')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ThreatAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      if (activeTab === 'url' || activeTab === 'text') {
        const endpoint =
          activeTab === 'url' ? '/api/analyze/url' : '/api/analyze/text'
        const res = await api.post<QuickScanResult>(endpoint, {
          input_type: activeTab,
          content: input,
        })
        setResult(res.analysis)
      } else {
        setError(
          'File-based analysis (image, audio, documents) requires the full submission form. Use "Report an Incident" for file uploads.'
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analysis failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleMediaCapture = async (blob: Blob) => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      const ext = activeTab === 'image' ? 'png' : 'webm'
      const mimeType = activeTab === 'image' ? 'image/png' : 'audio/webm'
      formData.append('input_type', activeTab)
      formData.append('files', new File([blob], `capture.${ext}`, { type: mimeType }))

      const res = await api.upload<{ data: { classification: string; threat_score: number; confidence: number; ai_analysis: Record<string, unknown> } }>('/api/incidents', formData)
      const d = res.data
      if (d.ai_analysis) {
        setResult({
          classification: d.classification as ThreatAnalysis['classification'],
          threat_score: d.threat_score ?? 0,
          confidence: d.confidence ?? 0,
          summary: (d.ai_analysis as Record<string, string>).summary || 'Analysis submitted. Check the case detail page for full results.',
          indicators: (d.ai_analysis as Record<string, string[]>).indicators || [],
          mitigation_steps: (d.ai_analysis as Record<string, string[]>).mitigation_steps || [],
          risk_factors: (d.ai_analysis as Record<string, string[]>).risk_factors || [],
        })
      } else {
        setError('Incident submitted successfully. Analysis is processing — check the case page for results.')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setInput('')
    setResult(null)
    setError(null)
  }

  const loadSample = () => {
    if (activeTab === 'url') {
      const urls = demoSamples.urls
      const sample = urls[Math.floor(Math.random() * urls.length)]
      setInput(sample.url)
    } else if (activeTab === 'text') {
      const texts = demoSamples.texts
      const sample = texts[Math.floor(Math.random() * texts.length)]
      setInput(sample.content)
    }
  }

  return (
    <section id='try-it-now' className='bg-gray-50 px-4 py-20'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-10 text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-navy-900'>
            Try It Now
          </h2>
          <p className='mt-3 text-gray-500'>
            Paste a suspicious URL or message to get an instant AI analysis.
          </p>
        </div>

        {/* Tabs */}
        <div className='mb-6 flex gap-1 rounded-lg border border-gray-200 bg-white p-1'>
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                )}
              >
                <Icon className='h-4 w-4' strokeWidth={1.5} />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Input area */}
        <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-soft'>
          {activeTab === 'url' && (
            <Input
              placeholder='Paste a suspicious URL...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
          )}
          {activeTab === 'text' && (
            <Textarea
              placeholder='Paste a suspicious message, email, or SMS...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
            />
          )}
          {activeTab === 'image' && (
            <CameraCapture onCapture={handleMediaCapture} />
          )}
          {activeTab === 'audio' && (
            <AudioRecorder onCapture={handleMediaCapture} />
          )}
          {activeTab === 'file' && (
            <div className='flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center'>
              <p className='text-sm text-gray-500'>
                Document analysis is available through the full incident report form.
              </p>
              <a
                href='/submit'
                className='inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Go to Report Form
              </a>
            </div>
          )}

          {(activeTab === 'url' || activeTab === 'text') && (
            <div className='mt-4 flex items-center justify-between'>
              <button
                onClick={loadSample}
                className='text-xs font-medium text-blue-500 hover:text-blue-600'
              >
                Load sample
              </button>
              <Button onClick={handleScan} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className='mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        {/* Result */}
        {result && <ResultCard analysis={result} className='mt-6' />}
      </div>
    </section>
  )
}
