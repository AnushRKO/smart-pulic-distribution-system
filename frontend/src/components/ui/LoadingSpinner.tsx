export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Loading Smart PDS...</p>
      </div>
    </div>
  );
}
