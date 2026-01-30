"use client";

import { useMemo } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useDoc } from "@/hooks/useDoc";
import { formatRupiah } from "@/utils/format";

function safe(v) {
  return String(v ?? "").trim();
}

function Row({ label, value }) {
  return (
    <div className="flex flex-row gap-10 items-start">
      <div className="w-60 text-sm text-gray-700">{label}</div>
      <div className="bd rounded-lg p-2 w-full">
        <span className="text-sm">{value || "-"}</span>
      </div>
    </div>
  );
}

export default function BookingConfirmationPhase({
  bookingId,
  onBack,
  onSubmit,
  error,
}) {
  const { data: booking, loading, error: docError } = useDoc(
    "Bookings",
    bookingId,
    { enabled: Boolean(bookingId) }
  );

  const display = useMemo(() => {
    const b = booking || {};

    const packageInfo = b.package_info || {};
    const location = b.location_date_info || {};
    const customer = b.customer_info || b.reservation_details || {};
    const payment = b.payment_info || {};

    const venueMode = safe(location.venueSelectionMode || "catalog");

    const venueText =
      venueMode === "private_reference"
        ? [
            safe(location?.private_venue?.name || location?.privateVenue?.name),
            safe(location?.private_venue?.city || location?.privateVenue?.city),
            safe(location?.private_venue?.fullAddress || location?.privateVenue?.fullAddress),
            safe(location?.private_venue?.contactPerson || location?.privateVenue?.contactPerson),
          ]
            .filter(Boolean)
            .join(" • ")
        : safe(location.venue);

    const estBase =
      typeof payment.estimated_base_total_price === "number"
        ? payment.estimated_base_total_price
        : Number(payment.estimated_base_total_price || 0);

    return {
      bookingStatus: safe(b.bookingStatus),
      packageName: safe(packageInfo.package_name || packageInfo.packageList || packageInfo.package_list),
      packageCode: safe(packageInfo.package_code),
      isCustom: Boolean(packageInfo.isCustom),
      selectedServices: Array.isArray(packageInfo.selected_services)
        ? packageInfo.selected_services
        : Array.isArray(packageInfo.selectedServices)
        ? packageInfo.selectedServices
        : [],

      venueMode,
      venueText,
      eventDate: safe(location.date),
      weddingType: safe(location.wedding_type || location.weddingType),
      guestCount: String(location.guest_count ?? location.guestCount ?? ""),

      reservationName: safe(customer.reservation_name || customer.reservationName),
      primaryContactNumber: safe(customer.primary_contact_number || customer.primaryContactNumber),
      groomName: safe(customer.groom_name || customer.groomName),
      brideName: safe(customer.bride_name || customer.brideName),

      paymentScheme: safe(payment.payment_system || payment.payment_scheme),
      paymentMethod: safe(payment.payment_method),
      estimatedBaseTotalPrice: estBase,
    };
  }, [booking]);

  const handleSubmit = async () => {
    // extra guard: pastikan data beneran sudah ada dari DB
    if (!bookingId) return onSubmit?.({ ok: false, message: "Draft not found." });
    if (!booking) return onSubmit?.({ ok: false, message: "Booking data not ready yet." });

    await onSubmit?.({ ok: true });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-scroll h-full">
        <div>
          <h2 className="text-2xl">Booking Confirmation</h2>
          <p>Please review your booking draft before submitting.</p>
        </div>

        {error ? <div className="text-red-600 mt-3">{error}</div> : null}
        {docError ? <div className="text-red-600 mt-3">{String(docError)}</div> : null}

        {loading ? (
          <div className="mt-6">
            <LoadingSkeleton />
          </div>
        ) : !booking ? (
          <div className="mt-6 text-sm text-gray-700">
            Booking draft not found. Please go back and re-create the draft.
          </div>
        ) : (
          <div className="flex flex-col gap-16 mt-10">
            {/* Package */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">Package Details</h3>

              <Row label="Package Name" value={display.packageName} />
              <Row label="Package Code" value={display.packageCode} />
              <Row
                label="Custom Package"
                value={display.isCustom ? "Yes" : "No"}
              />
              <Row
                label="Selected Services"
                value={
                  display.selectedServices.length
                    ? display.selectedServices.join(", ")
                    : "-"
                }
              />
            </div>

            {/* Location & Date */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">Location & Date</h3>

              <Row
                label="Venue Selection Mode"
                value={display.venueMode === "private_reference" ? "Private Venue" : "Catalog Venue"}
              />
              <Row label="Venue" value={display.venueText} />
              <Row label="Event Date" value={display.eventDate} />
              <Row label="Wedding Type" value={display.weddingType} />
              <Row label="Guest Count" value={display.guestCount} />
            </div>

            {/* Reservation */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">Reservation Details</h3>

              <Row label="Reservation Name" value={display.reservationName} />
              <Row
                label="Primary Contact Number"
                value={display.primaryContactNumber}
              />
              <Row label="Groom Name" value={display.groomName} />
              <Row label="Bride Name" value={display.brideName} />
            </div>

            {/* Payment */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">Payment Details</h3>

              <Row
                label="Payment Scheme"
                value={
                  display.paymentScheme === "dp50"
                    ? "DP 50%"
                    : display.paymentScheme === "full"
                    ? "Full Payment"
                    : display.paymentScheme
                }
              />
              <Row label="Payment Method" value={display.paymentMethod} />
              <Row
                label="Estimated Base Total Price"
                value={formatRupiah(display.estimatedBaseTotalPrice)}
              />

              <div className="text-xs text-gray-500">
                * This page reads from the stored booking draft to avoid UI-state mismatch.
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-row justify-end gap-8">
          <button className="button1 w-50 rounded-lg" onClick={onBack} type="button">
            Back
          </button>

          <button
            className="button2 w-50 rounded-lg"
            type="button"
            onClick={handleSubmit}
            disabled={loading || !booking}
            title={!booking ? "Booking data not ready yet" : "Submit booking"}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
