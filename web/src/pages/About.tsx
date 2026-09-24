import { HeritageSection } from '../components/HeritageSection'
import { Testimonials } from '../components/Testimonials'

export function About() {
  return (
    <div>
      <section
        className="relative flex min-h-[20rem] items-center justify-center bg-cover bg-center px-6 py-20 text-center text-white"
        style={{ backgroundImage: "url('/img/marketing/beans-landscape.jpg')" }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(63, 39, 30, 0.72)' }} />
        <div className="relative">
          <h1 className="mb-3 text-4xl font-bold">About Araku Tribe Coffee</h1>
          <p className="mx-auto max-w-2xl text-lg opacity-90">
            Experience the Rich Heritage of Araku Coffee
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg sm:order-2">
          <img
            src="/img/marketing/valley-sunrise.jpg"
            alt="Sunrise over the Araku Valley coffee hills"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-5 text-brand-muted sm:order-1">
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
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 pb-16 text-brand-muted">
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
