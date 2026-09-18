interface LegalSection {
  heading: string
  body: string[]
}

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: LegalSection[]
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl">{title}</h1>
      <p className="mb-10 text-sm text-brand-muted">Last updated: {updated}</p>

      <ol className="space-y-8">
        {sections.map((section, i) => (
          <li key={section.heading}>
            <h2 className="mb-2 text-lg font-bold">
              {i + 1}. {section.heading}
            </h2>
            <div className="space-y-3 text-sm text-brand-muted">
              {section.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
