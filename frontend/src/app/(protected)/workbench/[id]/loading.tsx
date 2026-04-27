export default function WorkbenchDetailLoading() {
  return (
    <div className='space-y-6'>
      {/* Back link + case header */}
      <div className='h-4 w-32 rounded skeleton' />
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-56 rounded-lg skeleton' />
          <div className='h-4 w-80 rounded skeleton' />
        </div>
        <div className='h-9 w-36 rounded-lg skeleton' />
      </div>

      {/* Classification badge + threat score area */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='h-8 w-28 rounded-full skeleton' />
          <div className='h-8 w-20 rounded skeleton' />
          <div className='h-8 w-24 rounded skeleton' />
        </div>
      </div>

      {/* Analysis result skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-5 w-40 rounded skeleton' />
        <div className='mt-4 space-y-2'>
          <div className='h-4 w-full rounded skeleton' />
          <div className='h-4 w-5/6 rounded skeleton' />
          <div className='h-4 w-4/6 rounded skeleton' />
        </div>
      </div>

      {/* Analyst controls skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='h-5 w-32 rounded skeleton' />
        <div className='mt-4 flex gap-3'>
          <div className='h-10 w-32 rounded-lg skeleton' />
          <div className='h-10 w-32 rounded-lg skeleton' />
        </div>
      </div>
    </div>
  )
}
