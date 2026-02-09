import LoadingSkeleton from "@/components/LoadingSkeleton";
import Overlay from "@/components/Overlay";
import { formatRupiah } from "@/utils/format";

import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";

import { useMemo, useState, useCallback } from "react";

export default function Transaction({ patch, bookings }) {
  const { query, where, orderBy, colRef, setDoc, serverTimestamp } = useDb();

  // ✅ lebih aman: jangan pakai "!=" di Firestore query
  const invQuery = useMemo(() => {
    return () => query(colRef("Invoices"), orderBy("updatedAt", "desc"));
  }, [colRef, query, orderBy]);

  const { rows: invRows, loading: invLoading, error: invError } = useCollection(invQuery, [], {
    enabled: true,
  });

  // ✅ filter di UI aja (hemat headache index)
  const payableInvoices = useMemo(() => {
    const arr = Array.isArray(invRows) ? invRows : [];
    return arr.filter((i) => String(i.payment_status || "").toLowerCase() !== "unpaid");
  }, [invRows]);

  const [toggleRejection, setToggleRejection] = useState(null); // store invoice object
  const [message, setMessage] = useState("-");

  const confirmPayment = useCallback(
    async (invoice) => {
      if (!invoice?.id) return;

      // ✅ source of truth bookingId: langsung dari invoice
      const bookingId = invoice.booking_id;
      if (!bookingId) {
        console.error("Missing booking_id on invoice:", invoice);
        return;
      }

      // 1) update invoice
      await patch("Invoices", invoice.id, {
        payment_accepted: true,
        payment_rejected: false,
        payment_status: "accepted", // TODO: kalau kamu punya enum lain, ganti
        updatedAt: serverTimestamp(),
      });

      // 2) upsert transaction doc (docId deterministik = bookingId)
      //    ini otomatis "update kalau ada, create kalau belum ada"
      await setDoc(
        "Transactions",
        bookingId,
        {
          booking_id: bookingId,
          invoice_id: invoice.id,
          payment_rejected: false,
          payment_accepted: true,
          payment_amount: invoice.final_price ?? 0,
          rejected_reason: "-", // reset
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(), // merge:true aman, kalau udah ada gak overwrite kalau kamu gak mau bisa hapus
        },
        { merge: true }
      );

      return bookingId;
    },
    [patch, setDoc, serverTimestamp]
  );

  const rejectPayment = useCallback(
    async (invoice, reason) => {
      if (!invoice?.id) return;

      const bookingId = invoice.booking_id;
      if (!bookingId) {
        console.error("Missing booking_id on invoice:", invoice);
        return;
      }

      // update booking (kalau memang ini flow kamu)
      await patch("Bookings", bookingId, {
        bookingStatus: "Quotation", // TODO: pastikan enum bener
        updatedAt: serverTimestamp(),
      });

      // update invoice
      await patch("Invoices", invoice.id, {
        payment_rejected: true,
        payment_status: "rejected",
        payment_accepted: false,
        rejected_reason: reason || "-",
        updatedAt: serverTimestamp(),
      });

      // upsert transaction juga biar sinkron
      await setDoc(
        "Transactions",
        bookingId,
        {
          booking_id: bookingId,
          invoice_id: invoice.id,
          payment_rejected: true,
          payment_accepted: false,
          payment_amount: invoice.final_price ?? 0,
          rejected_reason: reason || "-",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [patch, setDoc, serverTimestamp]
  );

  if (invError) return <p>Database Error.</p>;

  return (
    <div className="w-full overflow-x-auto flex flex-col gap-4 overflow-y-scroll px-2 py-2 glassmorphism shadow-dark rounded-xl h-65">
      <Overlay
        isOpen={Boolean(toggleRejection)}
        onClose={() => setToggleRejection(null)}
        contentClassName="absolute bg-white w-100 habsolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <ConfirmationPopUp
          title="Reject Payment"
          text="Are you sure you want to reject this payment?"
          onClose={() => setToggleRejection(null)}
          onConfirm={async () => {
            const inv = toggleRejection;
            setToggleRejection(null);
            await rejectPayment(inv, message);
          }}
          setMessage={setMessage}
        />
      </Overlay>

      {!payableInvoices || invLoading ? (
        <LoadingSkeleton />
      ) : (
        payableInvoices.map((i) => (
          <TransList
            key={i.id}
            i={i}
            onConfirm={() => confirmPayment(i)}
            onReject={() => setToggleRejection(i)}
          />
        ))
      )}
    </div>
  );
}

function TransList({ i, onConfirm, onReject }) {
  const isAccepted = Boolean(i.payment_accepted);
  const isRejected = Boolean(i.payment_rejected);

  // ✅ tampil tombol hanya kalau belum accepted dan belum rejected
  const showActions = !isAccepted && !isRejected;

  return (
    <div className="flex flex-row items-center gap-6 px-2 py-4 rounded-xl bd-2 w-full h-12 overflow-hidden">
      <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
        <p className="text-xs">Invoice Id</p>
        <p className="text-sm">{i.id}</p>
      </div>
      <div className="flex flex-col items-baseline justify-start w-44 overflow-clip">
        <p className="text-xs">Booking Id</p>
        <p className="text-sm">{i.booking_id}</p>
      </div>
      <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
        <p className="text-xs">Payment System</p>
        <p className="text-sm">{i.payment_system}</p>
      </div>
      <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
        <p className="text-xs">Payment Method</p>
        <p className="text-sm">{i.payment_method}</p>
      </div>
      <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
        <p className="text-xs">Total</p>
        <p className="text-sm">{formatRupiah(i.final_price)}</p>
      </div>

      {showActions && (
        <div className="flex flex-row gap-4">
          <button
            className="text-sm p-1 border bg-emerald-500 text-white rounded-lg"
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevent bubbling
              onConfirm();
            }}
          >
            Confirm
          </button>
          <button
            className="text-sm p-1 border border-red-500 text-red-500 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmationPopUp({ title, text, subtext = "", onClose, onConfirm, setMessage }) {
  return (
    <div className="p-8">
      <div className="flex flex-col justify-center items-center gap-2">
        <h2>{title}</h2>
        <p className="text-sm text-center flex flex-row items-center justify-center">{text}</p>
        <p className="text-xs text-center">{subtext}</p>
        <div>
          <p>Rejection Reason</p>
          <input
            type="text"
            name="rj"
            id="rj"
            placeholder="enter a message"
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-row justify-center gap-4 mt-4">
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
}
