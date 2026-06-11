import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface LogEntry {
  /** Pre-formatted timestamp, `HH:MM:SS`. */
  time: string
  message: ReactNode
}

/** Format a Date as the `HH:MM:SS` stamp the log feed expects. */
export function logTime(d: Date = new Date()): string {
  return d.toTimeString().slice(0, 8)
}

/** Terminal activity feed: `> [HH:MM:SS] message` lines (`>` from `.log-line`). */
export function LogFeed({ entries, className }: { entries: LogEntry[]; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {entries.map((e, i) => (
        <div key={i} className="log-line">
          <span className="text-faint">[{e.time}]</span> {e.message}
        </div>
      ))}
    </div>
  )
}
