const TESTIMONIALS = [
  {
    name: 'Ramesh Varma',
    role: 'Bean & Brew, Vizag',
    quote:
      'Switching to Araku coffee changed our menu entirely — customers can taste the difference from the first sip. It’s become our best-selling brew.',
  },
  {
    name: 'Sneha Rao',
    role: 'The Koffee House, Vizag',
    quote:
      'The depth of flavor and the story behind every bag make Araku coffee an easy recommendation to every customer who walks in.',
  },
  {
    name: 'Vikram Shetty',
    role: 'Coastal Brews, Vizag',
    quote:
      'Consistent quality, ethically sourced, and genuinely delicious. Araku Tribe has been a reliable partner since day one.',
  },
  {
    name: 'Harini Das',
    role: 'Vizag Café Roastery',
    quote:
      'What stood out to us was the traceability — knowing exactly which tribal farms our coffee comes from. Our customers love that story.',
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-10 text-center text-2xl">What Our Partners Say</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="rounded-lg border bg-white p-6">
            <blockquote className="mb-4 text-sm text-brand-muted">"{t.quote}"</blockquote>
            <figcaption>
              <p className="font-bold">{t.name}</p>
              <p className="text-xs text-brand-muted">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
