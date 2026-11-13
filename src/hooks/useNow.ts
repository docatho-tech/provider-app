import { useEffect, useState } from 'react'

/**
 * A clock that ticks, so countdowns re-render instead of freezing at whatever
 * they read when the screen mounted.
 *
 * Every minute by default: the design's countdowns are in hours and minutes, so
 * a per-second timer would wake the screen sixty times to change nothing.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
