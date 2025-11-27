import { Hero } from '@/components/home/Hero'
import { ToolGrid } from '@/components/home/ToolGrid'
import { Features } from '@/components/home/Features'
import { Pricing } from '@/components/home/Pricing'

export default function Home() {
  return (
    <>
      <Hero />
      <ToolGrid />
      <Features />
      <Pricing />
    </>
  )
}
