import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-[60vh]">
      <div className="page-frame py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <Skeleton className="aspect-[4/5] w-full lg:col-span-6" />
          <div className="space-y-4 lg:col-span-6 lg:self-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      </div>
      <div className="page-frame space-y-6 py-10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
