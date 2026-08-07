export default function NoteSeat({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded ${color}`}></div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}