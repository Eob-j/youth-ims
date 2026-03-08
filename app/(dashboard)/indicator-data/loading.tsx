export default function IndicatorDataLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-80 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
        <div className="h-96 rounded bg-muted" />
      </div>
    </div>
  );
}
