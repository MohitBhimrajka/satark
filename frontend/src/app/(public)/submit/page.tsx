import { SubmitForm } from '@/components/incidents/submit-form'

export const metadata = { title: 'Report an Incident — Satark' }

export default function SubmitPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-12'>
      <div className='mb-8'>
        <h1 className='text-3xl font-semibold tracking-tight text-gray-900'>
          Report an Incident
        </h1>
        <p className='mt-2 text-gray-500'>
          Submit suspicious content for instant AI-powered threat analysis.
        </p>
      </div>
      <SubmitForm />
    </div>
  )
}
