export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="shimmer" style={{ height: 160 }} />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-4 w-3/4 rounded-lg shimmer" />
        <div className="h-3 w-full rounded-lg shimmer" />
        <div className="h-3 w-2/3 rounded-lg shimmer" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-3 w-20 rounded-lg shimmer" />
          <div className="h-3 w-14 rounded-lg shimmer" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="w-4 h-4 rounded-full shimmer" />
          <div className="h-3 w-24 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  )
}
