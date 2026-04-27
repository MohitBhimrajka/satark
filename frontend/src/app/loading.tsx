export default function RootLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-10 w-10 animate-spin rounded-full border-3 border-blue-500 border-t-transparent' />
        <p className='text-sm text-gray-500'>Loading...</p>
      </div>
    </div>
  )
}
