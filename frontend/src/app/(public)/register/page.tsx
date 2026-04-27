export const metadata = { title: 'Register — Satark' }

export default function RegisterPage() {
  return (
    <div className='flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-soft'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Create Account
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Register to access incident management tools.
        </p>
      </div>
    </div>
  )
}
