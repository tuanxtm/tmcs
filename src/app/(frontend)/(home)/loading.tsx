import { FeedGrid } from '@/app/(frontend)/_components/layout/feed-grid'
import { Skeleton } from '@/components/ui/skeleton'

function FeedSkeleton() {
  return (
    <div data-block-type="feedSection">
      <div className="section-header" aria-hidden="true">
        <Skeleton className="h-3 w-20 rounded-none" />
      </div>
      <FeedGrid aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="feed-grid-item space-y-2 p-2">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <Skeleton className="h-3 w-14 rounded-none" />
            <Skeleton className="h-4 w-3/4 rounded-none" />
          </div>
        ))}
      </FeedGrid>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div
        className="flex h-[var(--header-height)] items-center justify-between gap-4 px-2"
        aria-hidden="true"
      >
        <Skeleton className="h-4 w-32 rounded-none" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-none" />
          <Skeleton className="h-4 w-16 rounded-none" />
        </div>
      </div>

      <section
        className="relative flex min-h-[var(--hero-fold-height)] items-center justify-center"
        aria-hidden="true"
        data-block-type="hero"
      >
        <div className="flex w-full max-w-3xl flex-col items-center gap-3 px-4">
          <Skeleton className="h-3 w-16 rounded-none" />
          <Skeleton className="h-14 w-3/5 max-w-xl rounded-none" />
          <Skeleton className="h-3 w-2/5 max-w-md rounded-none" />
        </div>
      </section>

      <div className="flex flex-col gap-12">
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    </div>
  )
}
