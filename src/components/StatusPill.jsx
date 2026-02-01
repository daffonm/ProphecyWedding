import { bookingStatuses, vendorStatuses } from "@/utils/status";

export default function StatusPill({ statusLabel}) {
    
  const base = "w-20 h-5 px-1 flex items-center justify-center rounded-full text-xs bold";
  const status = bookingStatuses.find((s) => s.label === statusLabel) || vendorStatuses.find((s) => s.code === statusLabel) || ""
  
  return <span className={`${base} ${status?.color} ${status?.textColor}`}>{status?.label || "-"}</span>;
}
