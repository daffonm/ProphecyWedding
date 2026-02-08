import { useMemo, useState, useCallback } from "react";

import LoadingSkeleton from "@/components/LoadingSkeleton";
import Overlay from "@/components/Overlay";

import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { useDoc } from "@/hooks/useDoc";

function buildRequirementKey(v) {
  // Kalau kamu punya field unik seperti requirement_id, pakai itu
  // Untuk sementara, komposit key ini mengikuti struktur data yang kamu pakai di UI
  return `${v?.vendor_key ?? ""}::${v?.service_code ?? ""}::${v?.category ?? ""}`;
}

function filterRequirementsForVendor(assignment, vendorKey) {
  const list = assignment?.assigned_vendors ?? [];
  if (!vendorKey) return [];

  // Kamu sebelumnya pakai v.vendor_key, jadi aku pertahankan sebagai sumber utama
  // Sekaligus kasih fallback kalau ternyata ada nama field lain
  return list.filter((v) => v?.vendor_key === vendorKey || v?.vendor_uid === vendorKey || v?.vendor_id === vendorKey);
}

function AssignmentBox({ assignment, vendorKey, onOpen }) {
  const bookingId = assignment?.booking_id;

  const bookingDoc = useDoc("Bookings", bookingId, { enabled: Boolean(bookingId) });
  const { data: booking, loading: bookingLoading } = bookingDoc;

  // Venue lookup tetap di child agar kita tidak perlu bikin mekanisme batching query
  // Ini tidak mempengaruhi realtime status requirement karena itu berasal dari assignmentRows
  const { colRef, where, query } = useDb();
  const venueRef = booking?.location_date_info?.venue;

  const venueQuery = useMemo(() => {
    return () => {
      if (!venueRef) return null;
      return query(colRef("Vendors"), where("id", "==", venueRef));
    };
  }, [venueRef, colRef, where, query]);

  const { rows: venues, loading: venueLoading } = useCollection(venueQuery, [venueRef], {
    enabled: Boolean(venueRef),
  });

  const venue = venues?.[0];

  if (bookingLoading || venueLoading) return <LoadingSkeleton />;

  // Requirements tidak dipakai di card list, tapi kalau kamu mau tampilkan badge count bisa pakai ini
  // const myReq = filterRequirementsForVendor(assignment, vendorKey);

  return (
    <div className="bg-white bd-6 rounded-4xl p-4 w-100 border-t-10 border-emerald-500">
      <div className="flex flex-row">
        <h1 className="section-title">
          {booking?.customer_info?.groom_name} & {booking?.customer_info?.bride_name}
        </h1>
        <h1>&apos;s Wedding</h1>
      </div>

      <div>
        <h1>{venue?.name}</h1>
      </div>

      <div className="flex flex-row justify-between items-center">
        <p>{booking?.location_date_info?.date}</p>

        <button
          className="border rounded-4xl py-1 px-2 border-emerald-500 text-emerald-500"
          onClick={() => onOpen(assignment?.id)}
        >
          View
        </button>
      </div>
    </div>
  );
}

function AssignmentInfo({ assignment, vendorKey, onClose, onAccept }) {
  const bookingId = assignment?.booking_id;
  const bookingDoc = useDoc("Bookings", bookingId, { enabled: Boolean(bookingId) });
  const { data: booking, loading: bookingLoading } = bookingDoc;

  const requirements = useMemo(() => {
    return filterRequirementsForVendor(assignment, vendorKey);
  }, [assignment, vendorKey]);

  const statusColor = {requested: "text-yellow-500", rejected: "text-red-500", accepted: "text-emerald-500"}

  if (bookingLoading) return <LoadingSkeleton />;

  return (
    <div className="w-100 h-100 bg-white rounded-xl p-4">
      <button onClick={onClose}>X</button>

      <div className="flex flex-col">
        <h1 className="section-title">
          {booking?.customer_info?.groom_name} & {booking?.customer_info?.bride_name}
          &apos;s Wedding
        </h1>

        <p>Required Services :</p>

        <div className="flex flex-col gap-3">
          {requirements.length ? (
            requirements.map((r, index) => (
              <div key={index}>
                <div className="flex flex-row gap-4">
                  <p>{r?.service_code}</p>
                  <p className={statusColor[r?.assignment_status]}>{r?.assignment_status}</p>
                </div>

                <div>

                    {r.assignment_status === "requested" && 
                    <div className="flex flex-row gap-2">
                        <button className="border py-1 px-2 rounded-2xl">Reject</button>

                        <button
                            className="border py-1 px-2 rounded-2xl"
                            onClick={() =>
                            onAccept(assignment?.id, {
                                ...r,
                                assignment_status: "accepted",
                            })
                            }
                        >
                            Accept
                        </button>
                    </div>
                    }

                    {r.assignment_status === "rejected" && 
                    <div className="flex flex-row gap-2">
                        <p>Reason :</p>
                        <p className={statusColor[r?.assignment_status]} >{r?.reject_reason || "-"}</p>
                    </div>
                    }

                </div>
                
              </div>
            ))
          ) : (
            <p>No requirements for your vendor</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorEvent({ userVendor, userVendorLoading, userVendorError }) {
  const { colRef, where, query, setDoc } = useDb();

  const vendorKey = userVendor?.vendorID;

  const assignmentQuery = useMemo(() => {
    return () => {
      if (!vendorKey) return null;

      return query(
        colRef("vendor_assignments"),
        where("assigned_vendor_keys", "array-contains", vendorKey)
      );
    };
  }, [vendorKey, colRef, where, query]);

  const { rows: assignmentRows, loading: assignmentsLoading, error: assignmentsError } =
    useCollection(assignmentQuery, [vendorKey], { enabled: Boolean(vendorKey) });

  const completedAssigments = assignmentRows.filter(v => v.draft_status === "completed")

  // Ini yang biasanya bikin user merasa "ga realtime": selectedData disimpan di state
  // lalu tidak pernah ikut update saat assignmentRows berubah.
  // Solusinya: simpan hanya selectedAssignmentId, dan derive data dari assignmentRows.
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const selectedAssignment = useMemo(() => {
    if (!selectedAssignmentId) return null;
    return assignmentRows.find((a) => a?.id === selectedAssignmentId) ?? null;
  }, [assignmentRows, selectedAssignmentId]);

  const openAssignment = (id) => setSelectedAssignmentId(id);
  const closeOverlay = () => setSelectedAssignmentId(null);

  // Semua write ke DB dipusatkan di parent sesuai permintaanmu
  const acceptAssignment = useCallback(
    async (assignmentId, patchedRequirement) => {
      try {
        if (!assignmentId) return;

        const currentAssignment = assignmentRows.find((a) => a?.id === assignmentId);
        if (!currentAssignment) return;

        const current = currentAssignment?.assigned_vendors ?? [];

        const targetKey = buildRequirementKey(patchedRequirement);

        const next = current.map((item) => {
          const itemKey = buildRequirementKey(item);
          if (itemKey !== targetKey) return item;
          return { ...item, ...patchedRequirement };
        });

        await setDoc(
          "vendor_assignments",
          String(currentAssignment.id),
          { assigned_vendors: next },
          { merge: true }
        );
      } catch (e) {
        console.error("acceptAssignment error:", e);
      }
    },
    [assignmentRows, setDoc]
  );

  if (userVendorLoading) return <LoadingSkeleton />;
  if (userVendorError) return <p className="text-red-500">Failed to load vendor profile</p>;

  return (
    <div className="p-4">
      <Overlay
        isOpen={Boolean(selectedAssignmentId)}
        onClose={closeOverlay}
        contentClassName="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <AssignmentInfo
          assignment={selectedAssignment}
          vendorKey={vendorKey}
          onClose={closeOverlay}
          onAccept={acceptAssignment}
        />
      </Overlay>

      <div>

        <div className="flex flex-row items-baseline justify-between">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-xl">Event Assigned for You</h1>
          </div>
        </div>

        <div className="overflow-x-scroll no-scrollbar flex flex-row py-4 gap-8">
          {assignmentsLoading ? (
            <LoadingSkeleton />
          ) : assignmentsError ? (
            <p className="text-red-500">Failed to load assignments</p>
          ) : assignmentRows?.length ? (
            assignmentRows.map((a) => (
              <AssignmentBox
                key={a.id}
                assignment={a}
                vendorKey={vendorKey}
                onOpen={openAssignment}
              />
            ))
          ) : (
            <p>Admin have not set Assignments for you</p>
          )}
        </div>


        <div className="flex flex-row items-baseline justify-between mt-14">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-xl">Completed Events</h1>
          </div>
        </div>

        <div className="overflow-x-scroll no-scrollbar flex flex-row py-4 gap-8">
          {assignmentsLoading ? (
            <LoadingSkeleton />
          ) : assignmentsError ? (
            <p className="text-red-500">Failed to load assignments</p>
          ) : completedAssigments?.length ? (
            completedAssigments.map((a) => (
              <AssignmentBox
                key={a.id}
                assignment={a}
                vendorKey={vendorKey}
                onOpen={openAssignment}
              />
            ))
          ) : (
            <p>You have not completed any Assignments</p>
          )}
        </div>

      </div>
      
    </div>
  );
}
