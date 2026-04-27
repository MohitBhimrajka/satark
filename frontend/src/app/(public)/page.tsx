import { Hero } from '@/components/landing/hero'
import { StatsBar } from '@/components/landing/stats-bar'
import { TryItNow } from '@/components/landing/try-it-now'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <TryItNow />
      <HowItWorks />
      <Footer />
    </>
  )
}
