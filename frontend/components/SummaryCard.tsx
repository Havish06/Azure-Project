export function SummaryCard({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number | string;
  accent?: "slate" | "amber" | "emerald" | "sky";
}) {
  const accentBar: Record<string, string> = {
    slate: "bg-slate-400",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBar[accent]}`} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
