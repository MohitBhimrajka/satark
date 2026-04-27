'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { InputTypeSelector } from './input-type-selector'
import { SubmissionSuccess } from './submission-success'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import type { InputType, ApiResponse, Incident } from '@/types'
import { ApiClientError } from '@/lib/api-client'

interface SubmissionResult {
  caseNumber: string
  incidentId: string
  guestToken: string | null
}

export function SubmitForm() {
  const [inputType, setInputType] = useState<InputType | null>(null)
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)

  const isFileType =
    inputType === 'image' ||
    inputType === 'audio' ||
    inputType === 'video' ||
    inputType === 'document'

  const canSubmit =
    inputType &&
    !isSubmitting &&
    (isFileType ? !!file : content.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputType || !canSubmit) return

    setIsSubmitting(true)

    try {
      let res: ApiResponse<Incident>

      if (isFileType && file) {
        const formData = new FormData()
        formData.append('input_type', inputType)
        formData.append('file', file)
        if (description.trim()) formData.append('description', description)
        res = await api.upload<ApiResponse<Incident>>('/api/incidents', formData)
      } else {
        res = await api.post<ApiResponse<Incident>>('/api/incidents', {
          input_type: inputType,
          input_content: content,
          description: description || undefined,
        })
      }

      setResult({
        caseNumber: res.data.case_number,
        incidentId: res.data.id,
        guestToken: res.data.guest_token,
      })
      toast.success('Incident submitted!')
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message)
      } else {
        toast.error('Failed to submit. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success screen after submission
  if (result) {
    return (
      <SubmissionSuccess
        caseNumber={result.caseNumber}
        incidentId={result.incidentId}
        guestToken={result.guestToken}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Step 1: Choose input type */}
      <div className='space-y-3'>
        <h2 className='text-lg font-semibold text-gray-900'>
          1. What type of content are you reporting?
        </h2>
        <InputTypeSelector selected={inputType} onSelect={setInputType} />
      </div>

      {/* Step 2: Provide content */}
      {inputType && (
        <div className='animate-fade-in space-y-3'>
          <h2 className='text-lg font-semibold text-gray-900'>
            2. Provide the content
          </h2>

          {inputType === 'url' && (
            <Input
              placeholder='https://suspicious-link.com/login'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              type='url'
            />
          )}

          {inputType === 'text' && (
            <Textarea
              placeholder='Paste the suspicious message, email, or SMS here...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          )}

          {isFileType && (
            <FileUpload
              accept={
                inputType === 'image'
                  ? 'image/*'
                  : inputType === 'audio'
                    ? 'audio/*'
                    : inputType === 'video'
                      ? 'video/*'
                      : '.pdf,.doc,.docx,.txt,.csv,.xlsx'
              }
              onFileSelect={setFile}
            />
          )}
        </div>
      )}

      {/* Step 3: Optional description */}
      {inputType && (
        <div className='animate-fade-in space-y-3'>
          <h2 className='text-lg font-semibold text-gray-900'>
            3. Additional context{' '}
            <span className='font-normal text-gray-400'>(optional)</span>
          </h2>
          <Textarea
            placeholder='Describe how you encountered this content, who sent it, when, etc.'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Submit */}
      {inputType && (
        <div className='animate-fade-in'>
          <Button
            type='submit'
            size='lg'
            className='w-full'
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              'Submit for AI Analysis'
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
