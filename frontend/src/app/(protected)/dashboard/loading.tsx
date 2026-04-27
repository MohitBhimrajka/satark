export default function DashboardLoading() {
  return (
    <div className='space-y-6'>
      {/* Page header skeleton */}
      <div className='space-y-2'>
        <div className='h-8 w-48 rounded-lg skeleton' />
        <div className='h-4 w-80 rounded skeleton' />
      </div>

      {/* Stat cards — 4 cards matching the grid layout */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='h-3 w-20 rounded skeleton' />
            <div className='mt-3 h-8 w-16 rounded skeleton' />
            <div className='mt-2 h-3 w-24 rounded skeleton' />
          </div>
        ))}
      </div>

      {/* Charts — 2x3 grid with appropriate chart skeletons */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Donut charts (2) — circular shapes */}
        {[0, 1].map((i) => (
          <div key={`donut-${i}`} className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='h-4 w-36 rounded skeleton' />
            <div className='mt-6 flex justify-center'>
              <div className='h-40 w-40 rounded-full border-[12px] border-gray-100 skeleton' />
            </div>
          </div>
        ))}
        {/* Bar/area charts (4) — rectangular shapes */}
        {[0, 1, 2, 3].map((i) => (
          <div key={`bar-${i}`} className='rounded-xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='h-4 w-36 rounded skeleton' />
            <div className='mt-6 flex items-end gap-2'>
              {Array.from({ length: 8 }).map((_, j) => (
                <div
                  key={j}
                  className='flex-1 rounded-t skeleton'
                  style={{ height: `${40 + Math.random() * 100}px` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
