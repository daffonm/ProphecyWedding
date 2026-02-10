"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // sesuaikan path kamu
import { useDb } from "@/context/DbContext";     // sesuaikan path kamu
import { useCollection } from "@/hooks/useCollection";


import { navigateWithOrigin } from "@/utils/navigation";

import PackagePhase from "@/components/PackagePhase";
import LocationDatePhase from "@/components/LocationDatePhase";
import ReservationDetailsPhase from "@/components/ReservationDetailsPhase";
import BookingConfirmationPhase from "@/components/BookingConfirmationPhase";

import LoadingSkeleton from "@/components/LoadingSkeleton";

// Utils
import { formatRupiah } from "@/utils/format";
import { where } from "firebase/firestore";

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




function CompletedPhase({onGoHome }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Reservation Completed</h2>
      <div className="text-sm text-gray-700">
        Thank you for your reservation! We will contact you soon.
      </div>
      <div className="flex gap-2">
        <button className="border px-4 py-2" onClick={onGoHome}>
          To Home Page
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
  
  // API FETCHES
  const { user, loading: authReadyLoading } = useAuth();

  // PACKAGES
  const {db, colRef, query, orderBy, serverTimestamp, addDoc, setDoc, listenDoc} = useDb();
  const packageQuery = useMemo(() => {
      return () => query(colRef("Packages"), orderBy("order_value", "asc"));
    }, [colRef, orderBy, query]);
  
  const {
    rows: packages,
    loading: packagesLoading,
    error: packagesError,
  } = useCollection(packageQuery, [], { enabled: true });
  const pkg_default_value = packages.find((p) => p.code === "STANDART")?.name || "Standart";
  
// VENUES
  const venueQuery = useMemo(() => {
    return () => query(colRef("Venues"));
  }, [colRef, query]);

  const {
    rows: venueRows,
    loading: venuesLoading,
    error: venuesError,
  } = useCollection(venueQuery, [], { enabled: true });


//  =================== STATES ===================================
  const [bookingId, setBookingId] = useState(null);
  const [bookingPhase, setBookingPhase] = useState(1);
  const [error, setError] = useState("");

  // Phase fields

  // PACKAGE STATES
  const [packageList, setPackageList] = useState(pkg_default_value);

  // LOCATION & DATE STATES
  const [venue, setVenue] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingType, setWeddingType] = useState("")

  // NEW: private venue flow
  const [usePrivateVenue, setUsePrivateVenue] = useState(false);
  const [privateVenue, setPrivateVenue] = useState({
    name: "",
    city: "",
    fullAddress: "",
    contactPerson: "",
  });

  // CUSTOMER DETAIL STATES
  const [reservationName, setReservationName] = useState("");
  const [primaryContactNumber, setPrimaryContactNumber] = useState("");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");

    // NEW fields (customer)
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // NEW fields (payment)
  const [paymentAccount, setPaymentAccount] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");


  // PAYMENT INFO STATES
  const [paymentSystem, setPaymentSystem] = useState("dp50");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [estimatedBaseTotalPrice, setEstimatedBaseTotalPrice] = useState(0);

  // ESTIMATED BASE PRICE
  // const estimatedBaseTotalPrice = useMemo(() => {
  //   if (!venue) return 0;
  //   if (!guestCount) return 0;
  //   if (!weddingDate) return 0;
  //   if (!weddingType) return 0;
  //   if (usePrivateVenue) {
  //     if (!privateVenue.name) return 0;
  //     if (!privateVenue.city) return 0;
  //     if (!privateVenue.fullAddress) return 0;
  //     if (!privateVenue.contactPerson) return 0;
  //   }

  //   // Base Price Calculations
  //   return 100000;
  //   }, [venue, guestCount, weddingDate, weddingType, usePrivateVenue, privateVenue]);

  // MAIN CALCULATIONS
  const updateTotalEstimate = () => {
    
    const targetPackage = packages.find((p) => p.name === packageList) || "";
    const targetVenue = venueRows.find((v) => v.id === venue) || "";

    const targetPackagePrice = targetPackage?.base_price || 0;
    const targetVenuePrice = targetVenue?.base_price || 0;
   

    // For now do Basic Calculation
    setEstimatedBaseTotalPrice(targetPackagePrice + targetVenuePrice);
    console.log(estimatedBaseTotalPrice);

  }

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
 
    updateTotalEstimate()
    await setDoc(
        "Bookings",
        id,
        { ...partial, updatedAt: serverTimestamp() },
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
    const ref = await addDoc("Bookings", {
      customer_id: user.uid,
      bookingCompleted: false,
      bookingConfirmedByAdmin: false,
      bookingPhase: 1,
      bookingStatus: "Pending",

      customer_info: {
        reservation_name: "",
        primary_contact_number: "",
        groom_name: "",
        bride_name: "",

        city: "", // NEW
        address : "", // NEW
      },
      location_date_info: {
        venue: "",
        date: "",
        guest_count: 0,
        wedding_type: "",
        venueSelectionMode: "catalog",
        private_venue: null,
      },
      payment_info: {
        payment_system: "",
        payment_method: "",

        account: "", // NEW
        account_name: "", // NEW
        account_number: "", // NEW
      },
      package_info: {
        package_list: packageList || "basic",
      },

      estimated_total_price: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setBookingId(ref.id);
    localStorage.setItem(draftKey, ref.id);
    return ref.id;
  };

  const resetAll = () => {
    setBookingId(null);
    setBookingPhase(1);
    setError("");

    setPackageList(pkg_default_value);

    setVenue("");
    setGuestCount("");
    setWeddingDate("");
    setWeddingType("");
    setUsePrivateVenue(false);
    setPrivateVenue({ name: "", city: "", fullAddress: "", contactPerson: "" });

    setReservationName("");
    setPrimaryContactNumber("");
    setGroomName("");
    setBrideName("");
    
    setCustomerCity("");
    setCustomerAddress("");

    setPaymentAccount("");
    setPaymentAccountName("");
    setPaymentAccountNumber("");

    setPaymentSystem("dp50");
    setPaymentMethod("Bank Transfer");

    setEstimatedBaseTotalPrice(0);
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

    const unsub = listenDoc(
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

        setPackageList(b.package_info?.package_list || "Standart");

        setVenue(b.location_date_info?.venue || "");
        setGuestCount(String(b.location_date_info?.guest_count ?? ""));
        setWeddingDate(b.location_date_info?.date || "");
        setWeddingType(b.location_date_info?.wedding_type || "");


        setWeddingType(b.location_date_info?.weddingType || "");
        const mode = b.location_date_info?.venueSelectionMode || "catalog";
        setUsePrivateVenue(mode === "private_reference");
        setPrivateVenue(
          b.location_date_info?.privateVenue || {
            name: "",
            city: "",
            fullAddress: "",
            contactPerson: "",
          }
        );

        setReservationName(b.customer_info?.reservation_name || "");
        setPrimaryContactNumber(b.customer_info?.primary_contact_number || "");
        setGroomName(b.customer_info?.groom_name || "");
        setBrideName(b.customer_info?.bride_name || "");

        // NEW (customer)
        setCustomerCity(b.customer_info?.city || "");
        setCustomerAddress(b.customer_info?.address || "");

        // payment existing
        setPaymentSystem(b.payment_info?.payment_system || "dp50");
        setPaymentMethod(b.payment_info?.payment_method || "Bank Transfer");

        // NEW (payment)
        setPaymentAccount(b.payment_info?.account || "");
        setPaymentAccountName(b.payment_info?.account_name || "");
        setPaymentAccountNumber(b.payment_info?.account_number || "");

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
  const onPhase1Next = async ({
  ok,
  message,
  selectedPkgCode,
  selectedPkgName,
  isCustom,
  checkedServiceCodes,

  selectedServices
}) => {
  if (!ok) return setError(message || "Phase 1 invalid.");

  // Double safety validation (di parent juga)
  if (isCustom) {
    const codes = Array.isArray(checkedServiceCodes) ? checkedServiceCodes : [];
    if (codes.length < 1) return setError("Custom package wajib pilih minimal 1 service.");
  }

  const codes = Array.isArray(checkedServiceCodes) ? checkedServiceCodes : [];
  const resolved = Array.isArray(selectedServices) ? selectedServices : [];

  if (codes.length < 1) return setError("Custom package wajib pilih minimal 1 service.");
  if (resolved.length < 1) return setError("Selected services gagal dibentuk. Coba ulang pilih service.");


  setError("");

  const id = await createDraftIfNeeded(); // simpan id dari sini
  if (!id) return;

await updateBooking(
  {
    bookingPhase: 2,
    package_info: {
      packageList,
      package_code: selectedPkgCode || "",
      isCustom: Boolean(isCustom),

      // optional: simpan codes untuk query array-contains kalau kamu mau
      selected_service_codes: codes,

      // ini yang kamu mau: resolved snapshot (no join lagi untuk render/invoice)
      selected_services: resolved,

      package_name: selectedPkgName || packageList || "",
    },
  },
  id
);

  setBookingPhase(2);
};



  const onPhase2Next = async ({ ok, message, draft }) => {
    if (!ok) return setError(message || "Phase 2 invalid.");

    setError("");
    await createDraftIfNeeded();
    const info = draft?.location_date_info;
    if (info) {
      // sync state from draft (optional but helps consistency)
      setVenue(info.venue || "");
      setWeddingDate(info.date || "");
      setGuestCount(String(info.guestCount ?? ""));
      setWeddingType(info.weddingType || "");
      setUsePrivateVenue(info.venueSelectionMode === "private_reference");
      setPrivateVenue(
        info.privateVenue || { name: "", city: "", fullAddress: "", contactPerson: "" }
      );
    }

    await updateBooking({
      bookingPhase: 3,
      location_date_info: {
        venue: info ? info.venue : venue,
        date: info ? info.date : weddingDate,
        guest_count: info ? toNumber(info.guestCount) : toNumber(guestCount),
        wedding_type: info ? (info.weddingType || "") : (weddingType || ""),
        venueSelectionMode: info ? (info.venueSelectionMode || "catalog") : (usePrivateVenue ? "private_reference" : "catalog"),
        private_venue: info ? (info.privateVenue || null) : (usePrivateVenue ? privateVenue : null),
      },
    });
    setBookingPhase(3);
  };

  const onPhase3Next = async ({ ok, message, draft }) => {
    if (!ok) return setError(message || "Phase 3 invalid.");

    setError("");
    await createDraftIfNeeded();

    const info = draft?.reservation_details || draft?.customer_info || draft || {}

    await updateBooking({
      bookingPhase: 4,
      customer_info: {
        reservation_name: safeTrim(info?.customer?.reservationName ?? info?.reservation_name ?? reservationName),
        primary_contact_number: safeTrim(info?.customer?.primaryContactNumber ?? info?.primary_contact_number ?? primaryContactNumber),
        groom_name: safeTrim(info?.customer?.groom_name ?? info?.groom_name ?? groomName),
        bride_name: safeTrim(info?.customer?.bride_name ?? info?.bride_name ?? brideName),

        // NEW keep
        city: safeTrim(info?.customer?.city ?? info?.city ?? customerCity),
        address: safeTrim(info?.customer?.address ?? info?.address ?? customerAddress),
      },
      payment_info: {
        payment_system: info?.payment?.payment_system ?? info?.payment_system ?? paymentSystem,
        payment_method: info?.payment?.payment_method ?? info?.payment_method ?? paymentMethod,

        // NEW keep
        account: safeTrim(info?.payment?.account ?? info?.account ?? paymentAccount),
        account_name: safeTrim(info?.payment?.account_name ?? info?.account_name ?? paymentAccountName),
        account_number: safeTrim(info?.payment?.account_number ?? info?.account_number ?? paymentAccountNumber),
      },
    })


    

    setBookingPhase(4);
  };


  const onPhase4Submit = async ({ ok, message }) => {
    if (!ok) return setError(message || "Phase 4 invalid.");

    setError("");
    await createDraftIfNeeded();

    await updateBooking({
      bookingPhase: 5,
      bookingCompleted: true,
      bookingConfirmedByAdmin: false,
      bookingStatus: "Pending",
      estimated_total_price: estimatedBaseTotalPrice,
    });

    // Clear draft key so a new booking starts from scratch
    if (draftKey) localStorage.removeItem(draftKey);
    setBookingPhase(5);
  };

  // Guards
    if (authReadyLoading) return <LoadingSkeleton />; 
    if (!user) return null;



  // =========================
  // Render by phase
  // =========================
  return (
    <div className="flex flex-row justify-end">
      <div className="
      absolute
      bg-[url(/web-images/booking.jpeg)]
      bg-center
      bg-linear-to-r from-transparent to-green-900
      opacity-60
      w-90 left-0 -z-1
      h-screen ">
      
      </div>
      {/* Form */}
      <div className="container w-280 h-screen p-8 overflow-hidden rounded-l-3xl bg-gray-50">
        {bookingPhase === 1 && (
          <PackagePhase
            packages={packages}
            packagesLoading={packagesLoading}
            packagesError={packagesError}

            packageList={packageList}
            setPackageList={setPackageList}
            onNext={onPhase1Next}
            error={error}
          />
        )}

        {bookingPhase === 2 && (
          <LocationDatePhase

            venueRows={venueRows}
            venuesLoading={venuesLoading}
            venuesError={venuesError}


            venue={venue}
            setVenue={setVenue}
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            weddingDate={weddingDate}
            setWeddingDate={setWeddingDate}
            weddingType={weddingType}
            setWeddingType={setWeddingType}
            usePrivateVenue={usePrivateVenue}
            setUsePrivateVenue={setUsePrivateVenue}
            privateVenue={privateVenue}
            setPrivateVenue={setPrivateVenue}
            onBack={() => setBookingPhase(1)}
            onNext={onPhase2Next}
            error={error}
          />
        )}

        {bookingPhase === 3 && (
          <ReservationDetailsPhase
            reservationName={reservationName}
            setReservationName={setReservationName}
            primaryContactNumber={primaryContactNumber}
            setPrimaryContactNumber={setPrimaryContactNumber}
            groomName={groomName}
            setGroomName={setGroomName}
            brideName={brideName}
            setBrideName={setBrideName}

            // NEW (customer)
            customerCity={customerCity}
            setCustomerCity={setCustomerCity}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}

            paymentSystem={paymentSystem}
            setPaymentSystem={setPaymentSystem}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}

            // NEW (payment)
            paymentAccount={paymentAccount}
            setPaymentAccount={setPaymentAccount}
            paymentAccountName={paymentAccountName}
            setPaymentAccountName={setPaymentAccountName}
            paymentAccountNumber={paymentAccountNumber}
            setPaymentAccountNumber={setPaymentAccountNumber}

            onBack={() => setBookingPhase(2)}
            onNext={onPhase3Next}
            error={error}
          />

        )}

        {bookingPhase === 4 && (
          <BookingConfirmationPhase
            bookingId={bookingId}
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

    </div>
  );
}
