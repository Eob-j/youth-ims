export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative h-6 w-6">
        <div className="honeycomb-cell -left-7 top-0 [animation-delay:0s]" />
        <div className="honeycomb-cell -left-3.5 top-5.5 [animation-delay:0.1s]" />
        <div className="honeycomb-cell left-3.5 top-5.5 [animation-delay:0.2s]" />
        <div className="honeycomb-cell left-7 top-0 [animation-delay:0.3s]" />
        <div className="honeycomb-cell left-3.5 -top-5.5 [animation-delay:0.4s]" />
        <div className="honeycomb-cell -left-3.5 -top-5.5 [animation-delay:0.5s]" />
        <div className="honeycomb-cell left-0 top-0 [animation-delay:0.6s]" />
      </div>
    </div>
  );
}
