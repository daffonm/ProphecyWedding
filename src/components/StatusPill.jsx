export default function StatusPill({ status }) {
    
  const base = "px-2 py-1 rounded-full text-xs";
  if (status === "Pending") return <span className={`${base} bg-yellow-500/80 text-yellow-100`}>Pending</span>;
  if (status === "Accepted") return <span className={`${base} bg-emerald-500/80 text-emerald-100`}>Accepted</span>;
  if (status === "On Project") return <span className={`${base} bg-blue-500/80 text-blue-100`}>On Project</span>;
  if (status === "Cancelled") return <span className={`${base} bg-red-500/80 text-red-100`}>Cancelled</span>;
  return <span className={`${base} bg-slate-500/20 text-slate-200`}>{status || "-"}</span>;
}
