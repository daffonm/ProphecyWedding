import { useMemo, useState } from "react";
import { useDb } from "@/context/DbContext"; // sesuaikan path kamu
import { useCollection } from "@/hooks/useCollection";

import LoadingSkeleton from "@/components/LoadingSkeleton";

// Utils
import { formatRupiah } from "@/utils/format";

// =========================
// Helpers
// =========================
function safeTrim(v) {
  return String(v ?? "").trim();
}
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Helper
function limitCountByType(type, count) {
  switch (type) {
    case "Traditional":
      if (count > 1800) return 1800;
      break;
    case "Micro Scale":
      if (count > 50) return 50;
      break;
    case "Intimate":
      if (count > 100) return 100;
      break;
    case "Modern / Western":
      if (count > 1800) return 1800;
      break;
    default:
      if (count < 0) return 0;
      break;
  }
  return count;
}

function VenueBox({ v, selectedVenue, setVenue, normalizedGuest }) {
  const vid = v?.id ?? v?.docId ?? v?.uid ?? v?.name;
  const isSelected = String(selectedVenue || "") === String(vid || "");

  const capacity = toNumber(v?.capacity);
  const isAvailable = normalizedGuest <= capacity;

  return (
    <div
      className={`border rounded-xl overflow-hidden bg-white h-110 flex flex-col justify-between ${
        isSelected ? "ring-2 ring-green-500" : ""
      }`}
    >
      <div>
        <div className="bg-gray-200 h-54 w-full" />
        <div className="p-3 space-y-2">
          <div>
            <h2 className="font-semibold">{v?.name}</h2>
            <p className="text-xs text-gray-600 h-8">{v?.address}</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-gray-500">Base Price</p>
            <div className="font-semibold">{formatRupiah(v?.base_price)}</div>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-gray-500">Capacity</p>
            <div className="text-sm font-semibold">{capacity}</div>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          Your Estimated Guests:{" "}
          <span className="font-semibold">{normalizedGuest}</span>
          {!isAvailable ? (
            <span className="text-red-500"> (exceeds capacity)</span>
          ) : (
            <span className="text-green-600"> (available)</span>
          )}
        </div>

        <div className="flex flex-row justify-cente mt-2">
          <button
            type="button"
            className={`w-50 rounded-lg py-2 text-sm ${
              isSelected ? "bg-green-600 text-white" : "bg-gray-900 text-white"
            }`}
            onClick={() => setVenue(String(vid || ""))}
            disabled={!isAvailable}
            title={!isAvailable ? "Guest exceeds venue capacity" : "Select this venue"}
          >
            {isSelected ? "Selected" : "Select Venue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationDatePhase({
  venue,
  setVenue,
  guestCount,
  setGuestCount,
  weddingDate,
  setWeddingDate,
  weddingType,
  setWeddingType,
  onBack,
  onNext,
  error,
}) {
  const { colRef, query } = useDb();

  const venueQuery = useMemo(() => {
    return () => query(colRef("Venues"));
  }, [colRef, query]);

  const {
    rows: venueRows,
    loading: venuesLoading,
    error: venuesError,
  } = useCollection(venueQuery, [], { enabled: true });

  const [toggleDisplayVenue, setToggleDisplayVenue] = useState(false);

  // NEW: checkbox state
  const [usePrivateVenue, setUsePrivateVenue] = useState(false);

  // NEW: private venue form state (English)
  const [privateVenue, setPrivateVenue] = useState({
    name: "",
    city: "",
    fullAddress: "",
    contactPerson: "",
  });

  const normalizedGuest = useMemo(() => {
    return limitCountByType(weddingType || "Traditional", toNumber(guestCount));
  }, [weddingType, guestCount]);

  const filteredVenues = useMemo(() => {
    const rows = Array.isArray(venueRows) ? venueRows : [];
    return rows.filter((v) => toNumber(v?.capacity) >= normalizedGuest);
  }, [venueRows, normalizedGuest]);

  const validate = () => {
    if (!safeTrim(weddingDate)) return "Event date is required.";
    if (toNumber(guestCount) <= 0) return "Guest count must be greater than 0.";

    if (usePrivateVenue) {
      if (!safeTrim(privateVenue.name)) return "Venue name is required.";
      if (!safeTrim(privateVenue.city)) return "City is required.";
      if (!safeTrim(privateVenue.fullAddress)) return "Full address is required.";
      if (!safeTrim(privateVenue.contactPerson))
        return "Venue contact person is required.";
      return "";
    }

    if (!safeTrim(venue)) return "Venue must be selected.";
    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });

    // NEW: bundle draft payload for Next
    const draft = {
      location_date_info: {
        eventDate: weddingDate,
        weddingType: weddingType || "Traditional",
        guestCount: toNumber(normalizedGuest),
        venueSelectionMode: usePrivateVenue ? "private_reference" : "catalog",
        venue: usePrivateVenue ? null : venue,
        privateVenue: usePrivateVenue
          ? {
              name: safeTrim(privateVenue.name),
              city: safeTrim(privateVenue.city),
              fullAddress: safeTrim(privateVenue.fullAddress),
              contactPerson: safeTrim(privateVenue.contactPerson),
            }
          : null,
      },
    };

    await onNext({ ok: true, draft });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-scroll h-full">
        <div>
          <h2 className="text-2xl">Location & Date</h2>
          <p>Please submit requirements below so we can reserve your date and venue</p>
        </div>

        <div>
          <div className="flex flex-col gap-24 mt-10">
            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">Event Date</p>
                <input
                  className="bd rounded-lg p-2 w-50 outline-0"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  placeholder="Event Date"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Wedding Type</p>
                <select
                  className="bd rounded-lg p-2 w-80 outline-0"
                  value={weddingType || "Traditional"}
                  onChange={(e) => setWeddingType(e.target.value)}
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Modern / Western">Modern / Western</option>
                  <option value="Micro Scale">Micro Scale</option>
                  <option value="Intimate">Intimate</option>
                </select>
              </div>

              {weddingType === "Micro Scale" && (
                <p className="text-xs w-60 text-red-400">* max 50 guests</p>
              )}
              {weddingType === "Intimate" && (
                <p className="text-xs w-60 text-red-400">
                  * Intimates are limited to 100 guests
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm">Estimated Guest</p>

              <div className="flex flex-row gap-40 items-center">
                <input
                  className="bd rounded-lg p-2 w-50 outline-0"
                  type="number"
                  value={normalizedGuest}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="Type Guest Count"
                />

                {toNumber(guestCount) > 0 ? (
                  !toggleDisplayVenue && (
                    <button
                      type="button"
                      className="button1 rounded-lg"
                      onClick={() => setToggleDisplayVenue(true)}
                    >
                      See Available Venues
                    </button>
                  )
                ) : (
                  <p className="text-xs w-60 text-red-400">
                    * Final prices may vary based on your estimated guest count.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Venue Container */}
          {toggleDisplayVenue && (
            <div className="mt-8 p-2">
              {/* Checkbox */}
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="prefered"
                  checked={usePrivateVenue}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUsePrivateVenue(checked);

                    // kalau user switch ke private, jangan maksa venue katalog tersisa
                    if (checked) setVenue("");
                  }}
                />
                <p className="text-sm">I have my own preferred venue reference</p>
              </div>

              {/* PRIVATE VENUE FORM */}
              {usePrivateVenue ? (
                <div className="mt-8">
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-row gap-40 items-center">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm">Venue Name</p>
                        <input
                          className="bd rounded-lg p-2 w-80 outline-0"
                          type="text"
                          value={privateVenue.name}
                          onChange={(e) =>
                            setPrivateVenue((s) => ({ ...s, name: e.target.value }))
                          }
                          placeholder="Enter venue name"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-sm">City</p>
                        <input
                          className="bd rounded-lg p-2 w-50 outline-0"
                          type="text"
                          value={privateVenue.city}
                          onChange={(e) =>
                            setPrivateVenue((s) => ({ ...s, city: e.target.value }))
                          }
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-40 items-center">
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm">Full Address</p>
                        <input
                          className="bd rounded-lg p-2 w-full outline-0"
                          type="text"
                          value={privateVenue.fullAddress}
                          onChange={(e) =>
                            setPrivateVenue((s) => ({
                              ...s,
                              fullAddress: e.target.value,
                            }))
                          }
                          placeholder="Enter full address (street, area, postal code)"
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-40 items-center">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm">Venue Contact Person</p>
                        <input
                          className="bd rounded-lg p-2 w-80 outline-0"
                          type="text"
                          value={privateVenue.contactPerson}
                          onChange={(e) =>
                            setPrivateVenue((s) => ({
                              ...s,
                              contactPerson: e.target.value,
                            }))
                          }
                          placeholder="Name / phone / email"
                        />
                      </div>

                      <p className="text-xs w-60 text-gray-500">
                        * Please provide a reachable contact person for coordination.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // CATALOG VENUE GRID
                <div className="mt-8">
                  {venuesError ? (
                    <div className="text-red-600">{String(venuesError)}</div>
                  ) : null}

                  {venuesLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      {filteredVenues.length === 0 ? (
                        <div className="text-sm text-gray-600">
                          No venues available for your{" "}
                          <span className="font-semibold">{weddingType}</span>{" "}
                          wedding type with{" "}
                          <span className="font-semibold">{normalizedGuest}</span>{" "}
                          guests. Please adjust your guest count, or change your wedding type.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                          {filteredVenues.map((v, k) => (
                            <VenueBox
                              key={v?.id ?? v?.name ?? k}
                              v={v}
                              selectedVenue={venue}
                              setVenue={setVenue}
                              normalizedGuest={normalizedGuest}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-row justify-end gap-8">
          <button className="button1 w-50 rounded-lg" onClick={onBack} type="button">
            Back
          </button>

          <button
            className={
              usePrivateVenue
                ? "button2 w-50 rounded-lg"
                : venue
                ? "button2 w-50 rounded-lg"
                : "button-grayed w-50 rounded-lg disabled:bg-gray-400"
            }
            type="button"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
