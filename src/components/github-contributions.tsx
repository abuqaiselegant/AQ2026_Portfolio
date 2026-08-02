import { Gitmap, ContributionDay } from "@/components/ui/gitmap"
import { addDays } from "date-fns"
import { cn } from "@/lib/utils"

const API_BASE = "https://github-contributions-api.jogruber.de/v4"
const REQUEST_TIMEOUT_MS = 8000

/**
 * Fetches the contribution graph from a third-party service. That service is
 * outside our control, so every failure mode is contained here and reported as
 * null: the homepage is prerendered at build time, and an uncaught throw here
 * fails the whole build.
 */
async function fetchContributions(): Promise<ContributionDay[] | null> {
  try {
    const response = await fetch(`${API_BASE}/abuqaiselegant`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) return null

    const data = await response.json()
    return Array.isArray(data?.contributions) ? data.contributions : null
  } catch {
    // Network error, timeout, or malformed JSON.
    return null
  }
}

export async function GithubContributions() {
  const contributions = await fetchContributions()

  // Degrade to the skeleton rather than breaking the page. The next
  // revalidation picks the data up once the service recovers.
  if (!contributions) {
    return <GitmapSkeleton className="mt-7 mb-8" />
  }

  const today = new Date()

  return (
    <div data-gitmap-theme="ocean" className="mt-7 mb-8 overflow-x-auto sm:overflow-x-clip">
      <Gitmap
        contributions={contributions}
        from={addDays(today, -365)}
        to={today}
        colors={{
          empty: "var(--gitmap-empty)",
          level1: "var(--gitmap-level-1)",
          level2: "var(--gitmap-level-2)",
          level3: "var(--gitmap-level-3)",
          level4: "var(--gitmap-level-4)",
        }}
        showCounts={true}
        cellGap={2}
      />
    </div>
  )
}

export function GitmapSkeleton({ className }: { className?: string }) {
  const weeks = 53
  const cellSize = 10
  const cellGap = 2

  return (
    <div className={cn("relative", className)} style={{ paddingLeft: 28, paddingTop: 15 }}>
      <div className="absolute -top-1 left-[28px] flex gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-3 w-5 rounded bg-muted/50 animate-pulse" />
        ))}
      </div>

      <div className="absolute left-0 top-[15px] space-y-[19px] pt-[7px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2.5 w-4 rounded bg-muted/50 animate-pulse" />
        ))}
      </div>

      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(7, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${weeks}, ${cellSize}px)`,
          gap: cellGap,
        }}
      >
        {Array.from({ length: weeks * 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[2px] bg-muted animate-pulse"
            style={{
              width: cellSize,
              height: cellSize,
              opacity: 0.2 + ((i * 7 + 13) % 17) / 17 * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  )
}