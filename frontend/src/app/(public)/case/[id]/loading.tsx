export default function CaseLoading() {
  return (
    <div className='mx-auto max-w-4xl space-y-6 px-4 py-12'>
      {/* Case header */}
      <div className='space-y-2'>
        <div className='h-8 w-64 rounded-lg skeleton' />
        <div className='flex gap-3'>
          <div className='h-6 w-20 rounded-full skeleton' />
          <div className='h-6 w-24 rounded-full skeleton' />
        </div>
      </div>

      {/* Analysis result skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-5 w-40 rounded skeleton' />
        <div className='mt-4 space-y-2'>
          <div className='h-4 w-full rounded skeleton' />
          <div className='h-4 w-5/6 rounded skeleton' />
          <div className='h-4 w-3/4 rounded skeleton' />
        </div>
        <div className='mt-6 space-y-3'>
          <div className='h-4 w-32 rounded skeleton' />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='ml-4 h-4 w-2/3 rounded skeleton' />
          ))}
        </div>
      </div>

      {/* Evidence files skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-5 w-28 rounded skeleton' />
        <div className='mt-3 h-12 w-full rounded-lg skeleton' />
      </div>

      {/* Audit trail skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-5 w-24 rounded skeleton' />
        <div className='mt-4 space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div className='h-3 w-3 rounded-full skeleton' />
              <div className='h-4 flex-1 rounded skeleton' />
              <div className='h-4 w-28 rounded skeleton' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
