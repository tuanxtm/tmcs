import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div>
      <section className="relative dash-b" aria-hidden="true">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="aspect-square p-2">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="flex aspect-square flex-col justify-center gap-4 p-2">
            <Skeleton className="h-14 w-4/5 max-w-xl rounded-none" />
            <Skeleton className="h-4 w-3/5 max-w-lg rounded-none" />
            <Skeleton className="h-4 w-2/5 max-w-lg rounded-none" />
          </div>
        </div>
      </section>

      <div className="space-y-6 dash-b py-10" aria-hidden="true">
        <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="aspect-square rounded-none" />
          <Skeleton className="aspect-square rounded-none" />
          <Skeleton className="aspect-square rounded-none md:col-span-1 lg:col-span-2" />
          <Skeleton className="aspect-square rounded-none" />
        </div>
      </div>
    </div>
  )
}
