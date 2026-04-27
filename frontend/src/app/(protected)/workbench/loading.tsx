export default function WorkbenchLoading() {
  return (
    <div className='space-y-6'>
      {/* Page header skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-48 rounded-lg skeleton' />
          <div className='h-4 w-64 rounded skeleton' />
        </div>
        <div className='h-9 w-24 rounded-lg skeleton' />
      </div>

      {/* Search + filter bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='h-10 flex-1 rounded-lg skeleton' />
        <div className='h-10 w-96 rounded-lg skeleton' />
      </div>

      {/* Table skeleton */}
      <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
        {/* Table header */}
        <div className='flex items-center gap-4 border-b border-gray-100 px-5 py-3'>
          <div className='h-3 w-24 rounded skeleton' />
          <div className='h-3 w-14 rounded skeleton' />
          <div className='h-3 w-16 rounded skeleton' />
          <div className='h-3 w-12 rounded skeleton' />
          <div className='h-3 w-16 rounded skeleton' />
          <div className='h-3 w-20 rounded skeleton' />
        </div>
        {/* Table rows — column widths matching actual layout */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4 border-b border-gray-50 px-5 py-3.5'>
            <div className='h-5 w-28 rounded skeleton' />
            <div className='h-5 w-14 rounded skeleton' />
            <div className='h-5 w-20 rounded-full skeleton' />
            <div className='h-5 w-10 rounded skeleton' />
            <div className='h-5 w-16 rounded-full skeleton' />
            <div className='h-5 w-28 rounded skeleton' />
          </div>
        ))}
      </div>
    </div>
  )
}
