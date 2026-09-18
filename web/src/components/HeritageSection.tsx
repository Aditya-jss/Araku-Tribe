const HERITAGE = [
  {
    title: 'Traditional Methods',
    body: 'Grown and harvested using techniques passed down through generations of Araku Valley\'s tribal communities, honoring the land as much as the harvest.',
  },
  {
    title: 'Harmony With the Land',
    body: 'Shade-grown among native forest cover, our coffee is cultivated without disrupting the biodiversity of the Eastern Ghats.',
  },
  {
    title: 'Global Recognition',
    body: 'Araku coffee has earned international acclaim for its distinct flavor profile — a direct result of the valley\'s unique altitude and soil.',
  },
]

export function HeritageSection() {
  return (
    <section className="px-6 py-16" style={{ backgroundColor: 'var(--color-brand-cream)' }}>
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl">A Heritage Rooted in the Araku Valley</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {HERITAGE.map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="mb-2 font-bold" style={{ color: 'var(--color-brand-brown)' }}>
                {item.title}
              </h3>
              <p className="text-sm text-brand-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
