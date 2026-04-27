export default function WorkbenchLoading() {
  return (
    <div className='space-y-4'>
      <div className='h-8 w-48 rounded-lg skeleton' />
      <div className='h-12 rounded-lg skeleton' />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='h-14 rounded-lg skeleton' />
      ))}
    </div>
  )
}
