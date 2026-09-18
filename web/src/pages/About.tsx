import { HeritageSection } from '../components/HeritageSection'
import { Testimonials } from '../components/Testimonials'

export function About() {
  return (
    <div>
      <section
        className="px-6 py-20 text-center text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <h1 className="mb-3 text-4xl font-bold">About Araku Tribe Coffee</h1>
        <p className="mx-auto max-w-2xl text-lg opacity-90">
          Experience the Rich Heritage of Araku Coffee
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-brand-muted">
        <p>
          Araku Tribe began as more than a coffee brand — it's a community-driven movement built
          alongside the tribal farmers of the Araku Valley in the Eastern Ghats. What started as a
          handful of partnerships with local growers has become a shared commitment to quality,
          sustainability, and fair trade at every step of the journey from soil to cup.
        </p>
        <p>
          Quality begins in the field. Our coffee cherries are handpicked at peak ripeness by
          farmers who have refined their craft over generations, ensuring every batch reflects the
          altitude, soil, and care that make Araku coffee distinct.
        </p>
        <p>
          We work directly with farming communities through fair-trade partnerships, so more of
          the value created by every bag sold flows back to the people who grow it — not just
          middlemen. It's a relationship built on trust, not transactions.
        </p>
        <p>
          Sustainability isn't an afterthought — it's built into how we operate, from
          shade-grown cultivation methods that protect the valley's biodiversity to eco-friendly,
          recyclable packaging that reduces our footprint from farm to doorstep.
        </p>
        <p>
          Today, Araku Tribe is a legacy in progress — one shaped by the communities who grow our
          coffee and the people who choose to drink it. Every cup is a small part of that story,
          and we're glad to have you in it.
        </p>
      </section>

      <HeritageSection />
      <Testimonials />
    </div>
  )
}
