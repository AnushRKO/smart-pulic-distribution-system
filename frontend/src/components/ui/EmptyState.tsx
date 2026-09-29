import { Inbox } from 'lucide-react';
interface Props { title?: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; }
export default function EmptyState({ title = 'No data found', description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
        {icon || <Inbox size={24} className="text-gray-400"/>}
      </div>
      <div>
        <p className="text-base font-medium text-gray-700">{title}</p>
        {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
