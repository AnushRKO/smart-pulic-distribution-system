interface Props { page: number; totalPages: number; onPageChange: (p: number) => void; }
export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
        ← Prev
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5 && page > 3) p = page - 2 + i;
        if (p > totalPages) return null;
        return (
          <button key={p} onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${p === page ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            {p}
          </button>
        );
      })}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">
        Next →
      </button>
    </div>
  );
}
