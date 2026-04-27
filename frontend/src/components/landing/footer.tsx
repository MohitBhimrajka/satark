import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className='border-t border-gray-200 bg-white px-4 py-10'>
      <div className='mx-auto flex max-w-4xl flex-col items-center gap-6 text-center'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500'>
            <Shield className='h-4 w-4 text-white' strokeWidth={1.5} />
          </div>
          <span className='text-lg font-bold text-navy-900'>Satark</span>
        </div>

        {/* Description */}
        <p className='max-w-md text-sm text-gray-500'>
          AI-Powered Cyber Incident Intelligence Portal for the Ministry of Defence
          and CERT-Army.
        </p>

        {/* Tech badges */}
        <div className='flex flex-wrap justify-center gap-2'>
          {['Next.js', 'FastAPI', 'AI Engine', 'PostgreSQL'].map((tech) => (
            <span
              key={tech}
              className='rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500'
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom */}
        <div className='border-t border-gray-100 pt-6'>
          <p className='text-xs text-gray-400'>
            Smart India Hackathon 2025 &bull; Problem Statement ID: 25210
            <br />
            Ministry of Defence / CERT-Army
          </p>
        </div>
      </div>
    </footer>
  )
}
