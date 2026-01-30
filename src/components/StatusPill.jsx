import { bookingStatuses } from "@/utils/status";

export default function StatusPill({ statusLabel }) {
    
  const status = bookingStatuses.find((s) => s.label === statusLabel);
  const base = "w-20 h-5 px-1 flex items-center justify-center rounded-full text-xs bold";
  
  return <span className={`${base} ${status?.color} ${status?.textColor}`}>{statusLabel|| "-"}</span>;
}
