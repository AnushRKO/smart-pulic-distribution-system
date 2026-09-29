import { X } from 'lucide-react';

interface Props {
  open: boolean; onClose: () => void;
  title: string; children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
