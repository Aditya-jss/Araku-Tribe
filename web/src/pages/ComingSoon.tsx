export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="mb-4 text-3xl">{title}</h1>
      <p className="text-brand-muted">This page is being rebuilt — check back soon.</p>
    </div>
  )
}
