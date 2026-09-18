import { useState } from 'react'
import { Link } from 'react-router-dom'

const WHY_US = [
  'Premium, single-origin Araku Valley coffee with a loyal, growing customer base',
  'Full training on brewing, service standards, and store operations',
  'Marketing support and access to our supplier network from day one',
  'Proven store formats sized for cafés, kiosks, and franchise counters',
  'Ongoing support from our team throughout the life of your franchise',
]

const DETAILS: [string, string][] = [
  ['Investment', '$7,000'],
  ['Offerings', 'Premium coffee & machines'],
  ['Ideal Partners', 'Entrepreneurs & Investors'],
]

const TABS = ['Why Araku Tribe?', 'Franchise Details'] as const

export function Franchise() {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0])

  return (
    <div>
      <section
        className="px-6 py-20 text-center text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <h1 className="mb-4 text-4xl font-bold">And Start Your Araku Tribe Coffee Franchise Today!</h1>
        <p className="mb-2 text-lg opacity-90">
          <span className="mr-2 line-through opacity-60">$8,000</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-brand-gold)' }}>
            $7,000
          </span>{' '}
          starting investment
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-block rounded px-6 py-3 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Enquire Now
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-brand-muted">
        <p className="mb-4">
          Bring the Araku Tribe coffee experience to your city. Our franchise model gives you
          everything you need to open a store built around premium, ethically sourced coffee —
          from equipment and training to ongoing operational support.
        </p>
        <p className="mb-6">
          As a partner, you'll offer:
        </p>
        <ul className="mb-2 list-disc space-y-2 pl-6">
          <li>Premium high-altitude coffee, sourced directly from Araku Valley farmers</li>
          <li>A sustainable, ethical brand story that resonates with today's customers</li>
        </ul>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="mb-6 flex justify-center gap-2 border-b">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="border-b-2 px-4 py-2 font-medium"
              style={{
                borderColor: tab === t ? 'var(--color-brand-gold)' : 'transparent',
                color: tab === t ? 'var(--color-brand-brown)' : undefined,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Why Araku Tribe?' ? (
          <ul className="space-y-3">
            {WHY_US.map((point) => (
              <li key={point} className="flex gap-3">
                <span style={{ color: 'var(--color-brand-amber)' }}>✓</span>
                <span className="text-brand-muted">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <table className="w-full border-collapse overflow-hidden rounded-lg border text-left">
            <tbody>
              {DETAILS.map(([label, value]) => (
                <tr key={label} className="border-b last:border-0">
                  <th className="w-1/3 bg-gray-50 px-4 py-3 font-medium">{label}</th>
                  <td className="px-4 py-3 text-brand-muted">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
