export default function DashboardLoading() {
  return (
    <div className='space-y-6'>
      <div className='h-8 w-48 rounded-lg skeleton' />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-28 rounded-xl skeleton' />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='h-64 rounded-xl skeleton' />
        ))}
      </div>
    </div>
  )
}
