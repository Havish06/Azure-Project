const STYLES: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  InUse: "bg-sky-100 text-sky-700 ring-sky-600/20",
  UnderMaintenance: "bg-amber-100 text-amber-800 ring-amber-600/20",
  Retired: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Scheduled: "bg-sky-100 text-sky-700 ring-sky-600/20",
  Completed: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  Overdue: "bg-red-100 text-red-700 ring-red-600/20",
};

const LABELS: Record<string, string> = {
  UnderMaintenance: "Under Maintenance",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {LABELS[status] || status}
    </span>
  );
}
