"use client";

import LoadingSkeleton from "./LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";

function formatDateMaybe(v) {
  // kalau Firestore Timestamp: v?.toDate()
  try {
    if (!v) return "-";
    if (typeof v?.toDate === "function") {
      return v.toDate().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    // kalau string "YYYY-MM-DD"
    if (typeof v === "string") return v;
    return "-";
  } catch {
    return "-";
  }
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}

export default function MyBookList() {
  const { user, loading: authLoading } = useAuth();
  const db = useDb();

  const enabled = Boolean(user?.uid);

  const { rows: bookings, loading, error } = useCollection(
    () => {
      if (!enabled) return null;

      // Query: Bookings milik user ini, urut terbaru
      // Catatan: where + orderBy bisa butuh index di Firestore Console kalau diminta.
      return db.query(
        db.colRef("Bookings"),
        db.where("customer_id", "==", user.uid),
        db.orderBy("createdAt", "desc"),
        db.limit(50)
      );
    },
    [enabled, user?.uid],
    { enabled }
  );

  if (authLoading) return <LoadingSkeleton />;
  if (!user) {
    return (
      <div>
        <h2 className="text-lg font-semibold">My BookList</h2>
        <p className="mt-2 text-sm text-gray-600">Silakan login untuk melihat booking kamu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">My BookList</h2>
        <p className="mt-1 text-sm text-gray-600">
          Daftar booking yang pernah kamu buat.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Gagal mengambil data booking. {String(error?.message || "")}
          <div className="mt-2 text-xs text-red-700/80">
            Jika error menyebut “index”, buat composite index sesuai instruksi di Firestore Console.
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-gray-700">
          Belum ada booking. Silakan buat booking baru dulu.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const pkg = b.package_info?.packageList || "-";
            const venue = b.location_date_info?.venue || "-";
            const date = formatDateMaybe(b.location_date_info?.date);
            const guestCount = b.location_date_info?.guestCount ?? "-";

            const name = b.customer_info?.name || "-";
            const phone = b.customer_info?.phone || "-";

            const status = b.bookingStatus || (b.bookingCompleted ? "Pending" : "Draft");
            const confirmed = Boolean(b.bookingConfirmedByAdmin);

            return (
              <div key={b.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">
                        Booking #{b.id.slice(0, 8)}
                      </div>
                      <Badge>{status}</Badge>
                      {confirmed ? <Badge>Confirmed</Badge> : <Badge>Not confirmed</Badge>}
                      {b.bookingCompleted ? <Badge>Completed</Badge> : <Badge>In progress</Badge>}
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500">Package:</span>{" "}
                        <span className="font-medium">{pkg}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Venue:</span>{" "}
                        <span className="font-medium">{venue}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>{" "}
                        <span className="font-medium">{date}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Guest:</span>{" "}
                        <span className="font-medium">{guestCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Customer:</span>{" "}
                        <span className="font-medium">{name}</span>{" "}
                        <span className="text-gray-500">({phone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    <div>Created: {formatDateMaybe(b.createdAt)}</div>
                    <div>Updated: {formatDateMaybe(b.updatedAt)}</div>
                  </div>
                </div>

                {/* Optional: detail payment ringkas */}
                <div className="mt-3 text-sm text-gray-700">
                  <span className="text-gray-500">Payment:</span>{" "}
                  {b.payment_info?.payment_system || "-"} /{" "}
                  {b.payment_info?.payment_method || "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
