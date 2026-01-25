"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // sesuaikan path kamu
import { useDb } from "@/context/DbContext";     // sesuaikan path kamu


import { navigateWithOrigin } from "@/utils/navigation";
// =========================
// Helpers (di file yang sama)
// =========================
function safeTrim(v) {
  return String(v ?? "").trim();
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// =========================
// Phase Components
// =========================

function PackagePhase({ packageList, setPackageList, onNext, error }) {
  const validate = () => {
    if (!safeTrim(packageList)) return "Pilih package dulu.";
    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });
    await onNext({ ok: true });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Choose a Package</h2>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="space-y-1">
        <label className="block text-sm">Package</label>
        <select
          className="border p-2 w-full"
          value={packageList}
          onChange={(e) => setPackageList(e.target.value)}
        >
          <option value="basic">Basic Package</option>
          <option value="standard">Standard Package</option>
          <option value="premium">Premium Package</option>
        </select>
      </div>

      <button className="border px-4 py-2" onClick={handleNext}>
        Next
      </button>
    </div>
  );
}

function LocationDatePhase({
  venue,
  setVenue,
  guestCount,
  setGuestCount,
  weddingDate,
  setWeddingDate,
  onBack,
  onNext,
  error,
}) {
  const validate = () => {
    if (!safeTrim(venue)) return "Venue wajib dipilih.";
    if (!safeTrim(weddingDate)) return "Tanggal wajib diisi.";
    if (toNumber(guestCount) <= 0) return "Guest count harus lebih dari 0.";
    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });
    await onNext({ ok: true });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Location & Date</h2>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="space-y-1">
        <label className="block text-sm">Venue</label>
        <select
          className="border p-2 w-full"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        >
          <option value="">-- pilih --</option>
          <option value="venueA">Venue A</option>
          <option value="venueB">Venue B</option>
          <option value="venueC">Venue C</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Guest Count</label>
        <input
          className="border p-2 w-full"
          type="number"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          placeholder="e.g. 200"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Wedding Date</label>
        <input
          className="border p-2 w-full"
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button className="border px-4 py-2" onClick={onBack}>
          Back
        </button>
        <button className="border px-4 py-2" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function CustomerInfoPhase({
  name,
  setName,
  phone,
  setPhone,
  bridegroom,
  setBridegroom,
  bride,
  setBride,
  onBack,
  onNext,
  error,
}) {
  const validate = () => {
    if (!safeTrim(name)) return "Nama wajib diisi.";
    if (!safeTrim(phone)) return "No HP wajib diisi.";
    if (!safeTrim(bridegroom)) return "Nama bridegroom wajib diisi.";
    if (!safeTrim(bride)) return "Nama bride wajib diisi.";
    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });
    await onNext({ ok: true });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Customer Info</h2>

      {error ? <div className="text-red-600">{error}</div> : null}

      <input
        className="border p-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />
      <input
        className="border p-2 w-full"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />
      <input
        className="border p-2 w-full"
        value={bridegroom}
        onChange={(e) => setBridegroom(e.target.value)}
        placeholder="Bridegroom"
      />
      <input
        className="border p-2 w-full"
        value={bride}
        onChange={(e) => setBride(e.target.value)}
        placeholder="Bride"
      />

      <div className="flex gap-2">
        <button className="border px-4 py-2" onClick={onBack}>
          Back
        </button>
        <button className="border px-4 py-2" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function PaymentPhase({
  paymentSystem,
  setPaymentSystem,
  paymentMethod,
  setPaymentMethod,
  onBack,
  onSubmit,
  error,
}) {
  const validate = () => {
    if (!safeTrim(paymentSystem)) return "Pilih payment system.";
    if (!safeTrim(paymentMethod)) return "Pilih payment method.";
    return "";
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return onSubmit({ ok: false, message: msg });
    await onSubmit({ ok: true });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Payment</h2>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="space-y-2">
        <div className="text-sm font-medium">Payment System</div>
        <label className="flex gap-2 items-center">
          <input
            type="radio"
            name="paymentSystem"
            value="full"
            checked={paymentSystem === "full"}
            onChange={(e) => setPaymentSystem(e.target.value)}
          />
          Full
        </label>
        <label className="flex gap-2 items-center">
          <input
            type="radio"
            name="paymentSystem"
            value="dp50"
            checked={paymentSystem === "dp50"}
            onChange={(e) => setPaymentSystem(e.target.value)}
          />
          DP 50%
        </label>
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Payment Method</label>
        <select
          className="border p-2 w-full"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">-- pilih --</option>
          <option value="dana">Dana</option>
          <option value="ovo">OVO</option>
          <option value="gopay">Gopay</option>
          <option value="banktransfer">Bank Transfer</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button className="border px-4 py-2" onClick={onBack}>
          Back
        </button>
        <button className="border px-4 py-2" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className="text-xs text-gray-600">
        Catatan: jangan simpan data kartu sensitif (misal CVV) ke Firestore.
      </div>
    </div>
  );
}

function CompletedPhase({ onMakeAnother, onGoHome }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Reservation Completed</h2>
      <div className="text-sm text-gray-700">
        Booking kamu sudah tersimpan. Admin akan melakukan konfirmasi.
      </div>
      <div className="flex gap-2">
        <button className="border px-4 py-2" onClick={onGoHome}>
          Go Home
        </button>
        <button className="border px-4 py-2" onClick={onMakeAnother}>
          Make Another Booking
        </button>
      </div>
    </div>
  );
}

// =========================
// Booking Page
// =========================
export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authReadyLoading } = useAuth();

  const db = useDb();

  const [bookingId, setBookingId] = useState(null);
  const [bookingPhase, setBookingPhase] = useState(1);
  const [error, setError] = useState("");

  // Phase fields
  const [packageList, setPackageList] = useState("basic");

  const [venue, setVenue] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [weddingDate, setWeddingDate] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bridegroom, setBridegroom] = useState("");
  const [bride, setBride] = useState("");

  const [paymentSystem, setPaymentSystem] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const draftKey = useMemo(() => {
    return user ? `booking_draft_${user.uid}` : null;
  }, [user]);


  useEffect(() => {
    if (authReadyLoading) return;
    if (user) return;

    // originPath sebaiknya pakai current path (biar kalau booking ada query tetap kebawa)
    navigateWithOrigin(router, "/login");
  }, [authReadyLoading, user, router]);


  // ---- Core helpers
  const updateBooking = async (partial, idOverride) => {
    if (!user) throw new Error("NOT_LOGGED_IN");

    const id = idOverride || bookingId;
    if (!id) throw new Error("NO_BOOKING_ID");

    await db.setDoc(
        "Bookings",
        id,
        { ...partial, updatedAt: db.serverTimestamp() },
        { merge: true }
    );
    };


  const createDraftIfNeeded = async () => {
    if (!user) {
      setError("Harus login dulu.");
      return null;
    }

    // already have bookingId
    if (bookingId) return bookingId;

    // try localStorage
    const stored = draftKey ? localStorage.getItem(draftKey) : null;
    if (stored) {
      setBookingId(stored);
      return stored;
    }

    // create new draft
    const ref = await db.addDoc("Bookings", {
      customer_id: user.uid,
      bookingCompleted: false,
      bookingConfirmedByAdmin: false,
      bookingPhase: 1,
      bookingStatus: "Pending",

      customer_info: {
        name: "",
        phone: "",
        bridegroom: "",
        bride: "",
      },
      location_date_info: {
        venue: "",
        date: "",
        guestCount: 0,
      },
      payment_info: {
        payment_system: "",
        payment_method: "",
      },
      package_info: {
        packageList: packageList || "basic",
      },

      createdAt: db.serverTimestamp(),
      updatedAt: db.serverTimestamp(),
    });

    setBookingId(ref.id);
    localStorage.setItem(draftKey, ref.id);
    return ref.id;
  };

  const resetAll = () => {
    setBookingId(null);
    setBookingPhase(1);
    setError("");

    setPackageList("basic");
    setVenue("");
    setGuestCount("");
    setWeddingDate("");

    setName("");
    setPhone("");
    setBridegroom("");
    setBride("");

    setPaymentSystem("");
    setPaymentMethod("");
  };

  const startNewBooking = () => {
    if (draftKey) localStorage.removeItem(draftKey);
    resetAll();
  };

  // ---- Resume on refresh (listen to draft doc)
  useEffect(() => {
    if (authReadyLoading) return;
    if (!user || !draftKey) return;

    const stored = localStorage.getItem(draftKey);
    if (!stored) return;

    const unsub = db.listenDoc(
      "Bookings",
      stored,
      (snap) => {
        if (!snap.exists()) {
          localStorage.removeItem(draftKey);
          resetAll();
          return;
        }

        const b = snap.data();

        if (b.bookingCompleted) {
          // completed -> clear draft so next booking starts fresh
          localStorage.removeItem(draftKey);
          resetAll();
          return;
        }

        setBookingId(snap.id);
        setBookingPhase(b.bookingPhase || 1);

        setPackageList(b.package_info?.packageList || "basic");

        setVenue(b.location_date_info?.venue || "");
        setGuestCount(String(b.location_date_info?.guestCount ?? ""));
        setWeddingDate(b.location_date_info?.date || "");

        setName(b.customer_info?.name || "");
        setPhone(b.customer_info?.phone || "");
        setBridegroom(b.customer_info?.bridegroom || "");
        setBride(b.customer_info?.bride || "");

        setPaymentSystem(b.payment_info?.payment_system || "");
        setPaymentMethod(b.payment_info?.payment_method || "");
      },
      (err) => {
        console.error("Booking resume listener error:", err);
      }
    );

    return () => unsub?.();
  }, [user, draftKey]);

  // =========================
  // Phase save handlers (per phase)
  // =========================
  const onPhase1Next = async ({ ok, message }) => {
    if (!ok) return setError(message || "Phase 1 invalid.");

    setError("");

    const id = await createDraftIfNeeded(); // penting: simpan id dari sini
    if (!id) return;

    await updateBooking(
        {
        bookingPhase: 2,
        package_info: { packageList },
        },
        id
    );

    setBookingPhase(2);
    };


  const onPhase2Next = async ({ ok, message }) => {
    if (!ok) return setError(message || "Phase 2 invalid.");

    setError("");
    await createDraftIfNeeded();
    await updateBooking({
      bookingPhase: 3,
      location_date_info: {
        venue,
        date: weddingDate,
        guestCount: toNumber(guestCount),
      },
    });
    setBookingPhase(3);
  };

  const onPhase3Next = async ({ ok, message }) => {
    if (!ok) return setError(message || "Phase 3 invalid.");

    setError("");
    await createDraftIfNeeded();
    await updateBooking({
      bookingPhase: 4,
      customer_info: {
        name: safeTrim(name),
        phone: safeTrim(phone),
        bridegroom: safeTrim(bridegroom),
        bride: safeTrim(bride),
      },
    });
    setBookingPhase(4);
  };

  const onPhase4Submit = async ({ ok, message }) => {
    if (!ok) return setError(message || "Phase 4 invalid.");

    setError("");
    await createDraftIfNeeded();

    await updateBooking({
      bookingPhase: 5,
      payment_info: {
        payment_system: paymentSystem,
        payment_method: paymentMethod,
      },
      bookingCompleted: true,
      completedAt: db.serverTimestamp(),
    });

    // Clear draft key so a new booking starts from scratch
    if (draftKey) localStorage.removeItem(draftKey);
    setBookingPhase(5);
  };

  // Guards
    if (authReadyLoading) return <div className="container mx-auto p-6 max-w-lg">Loading...</div>; 
    if (!user) return null;



  // =========================
  // Render by phase
  // =========================
  return (
    <div className="container mx-auto p-6 max-w-lg">
      {bookingPhase === 1 && (
        <PackagePhase
          packageList={packageList}
          setPackageList={setPackageList}
          onNext={onPhase1Next}
          error={error}
        />
      )}

      {bookingPhase === 2 && (
        <LocationDatePhase
          venue={venue}
          setVenue={setVenue}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          weddingDate={weddingDate}
          setWeddingDate={setWeddingDate}
          onBack={() => setBookingPhase(1)}
          onNext={onPhase2Next}
          error={error}
        />
      )}

      {bookingPhase === 3 && (
        <CustomerInfoPhase
          name={name}
          setName={setName}
          phone={phone}
          setPhone={setPhone}
          bridegroom={bridegroom}
          setBridegroom={setBridegroom}
          bride={bride}
          setBride={setBride}
          onBack={() => setBookingPhase(2)}
          onNext={onPhase3Next}
          error={error}
        />
      )}

      {bookingPhase === 4 && (
        <PaymentPhase
          paymentSystem={paymentSystem}
          setPaymentSystem={setPaymentSystem}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onBack={() => setBookingPhase(3)}
          onSubmit={onPhase4Submit}
          error={error}
        />
      )}

      {bookingPhase === 5 && (
        <CompletedPhase
          onGoHome={() => router.push("/")}
          onMakeAnother={startNewBooking}
        />
      )}
    </div>
  );
}
