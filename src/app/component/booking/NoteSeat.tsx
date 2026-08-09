"use client";

export default function NoteSeat({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-[2px] ${color}`} />
      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>
    </div>
  );
}