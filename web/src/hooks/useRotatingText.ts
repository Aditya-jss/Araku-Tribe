import { useEffect, useState } from 'react'

export function useRotatingText(items: string[], intervalMs = 3500): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs)
    return () => clearInterval(id)
  }, [items.length, intervalMs])

  return items[index]
}
