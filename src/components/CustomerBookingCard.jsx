import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { useDoc } from "@/hooks/useDoc";


import StatusPill from "./StatusPill";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMemo } from "react";

import { useChat } from "@/context/ChatContext";

// Helper
function formatDate(value) {
  if (!value) return "-";
  return String(value);
}

function formatTimestamp(ts) {
  try {
    if (!ts) return "-";
    if (typeof ts?.toDate === "function") return ts.toDate().toLocaleString();
    return String(ts);
  } catch {
    return "-";
  }
}

const ADMIN_UID = "azEUp5PVaeR70v01bK4ufK2r3k72"

export default function CustomerBookingCard({b, toggleDetail}) {
    

    const { query, where, colRef, limit } = useDb();
    const {openChatToUserId} = useChat()

    const packageName = b.package_info?.package_name;
    const date = b.location_date_info?.date;

    const venueId = b.location_date_info?.venue;
    const venueQ = useMemo(() => {
        return () => query(colRef("Venues"), where("id", "==", venueId), limit(1));
    }, [colRef, query, venueId]);
    const {rows: venueRows, loading: venueLoading, error: venueError} = useCollection(venueQ, [], {enabled: Boolean(venueId)});
    
    const [venue] = venueRows;
    const venueName = venue?.name || "";
    const venueAddress = venue?.address || "";

    const guestCount = b.location_date_info?.guest_count;

    const brideName = b.customer_info?.bride_name;
    const groomName = b.customer_info?.groom_name;

    const bookingStatus = b.bookingStatus;
    const updatedAt = b.updatedAt || b.createdAt;





 


    return (
        <div className="flex flex-col bd-4 h-60 rounded-2xl overflow-hidden justify-between">

            <div className="px-4 py-2 flex flex-col h-full justify-between">
                <div>
                    <div className="flex flex-row justify-between items-center">
                        <h2>{packageName}</h2>
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-xs">Book for Date</p>
                            <p>{formatDate(date)}</p>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between items-baseline-last px-2">
                        <div className="flex flex-col">
                            <h2 className="text-xl section-title">{groomName + " & " + brideName}</h2>
                            { venueLoading ? <LoadingSkeleton /> : <p>{venueName}</p>}
                            { venueLoading ? <LoadingSkeleton /> : <p className="text-xs">{venueAddress}</p>}
                            <p className="text-xs mt-2">{guestCount} Guest</p>
                        </div>
                    </div>

                </div>
                <div className="flex flex-row justify-between pl-1">
                    <StatusPill statusLabel={bookingStatus}/>
                    <p className="text-xs">{formatTimestamp(updatedAt)}</p>
                </div>

            </div>
            

            {/* Card Footer */}
            <div className="flex flex-row justify-between bg-gray-100 border-t border-t-gray-400 p-4 px-5 h-15 items-center">
                <button className="text-sm" onClick={toggleDetail}>View Booking</button>
                <button className="w-25 text-sm bg-white border rounded-lg p-1" onClick={() => openChatToUserId(ADMIN_UID)}>Contact CS</button>
            </div>
        </div>
    )
}