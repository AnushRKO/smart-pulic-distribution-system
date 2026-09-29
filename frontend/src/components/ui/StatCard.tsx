interface Props {
  title: string; value: string | number; icon: React.ReactNode;
  iconBg?: string; subtitle?: string; trend?: { value: number; label: string };
}
export default function StatCard({ title, value, icon, iconBg = 'bg-primary-100', subtitle, trend }: Props) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
