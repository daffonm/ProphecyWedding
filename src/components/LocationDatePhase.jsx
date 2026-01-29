import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // sesuaikan path kamu
import { useDb } from "@/context/DbContext";     // sesuaikan path kamu
import { useCollection } from "@/hooks/useCollection";


import { navigateWithOrigin } from "@/utils/navigation";

import PackagePhase from "@/components/PackagePhase";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Utils
import { formatRupiah } from "@/utils/format";
import { where } from "firebase/firestore";

function VenueBox({v, selectedVenue, setVenue, guestCount}) {

    return (
        <div className="w-100 h-50 border">
            {/* ImageBox */}
            <div className="bg-gray-400"></div>
            <div>
                <h2>{v.name}</h2>
                <p className="text-sm">{v.address}</p>
            </div>
        </div>
    )
}


export default function LocationDatePhase({
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

  const {db, colRef, query, orderBy, serverTimestamp} = useDb();

  const venueQuery = useMemo(() => {
    return () => query(colRef("Venues"));
  }, [colRef, query]);

  const {
    rows: venueRows,
    loading: venuesLoading,
    error: venuesError,
  } = useCollection(venueQuery, [], { enabled: true });

  const [toggleDisplayVenue, setToggleDisplayVenue] = useState(false)
  console.log(venueRows)


  return (
    <div className="flex flex-col justify-between h-full">
      {/* content */}
      <div className="overflow-scroll h-full">
        <div>
            <h2 className="text-2xl">Location & Date</h2>
            <p>Please submit requirements below so we can reserve your date and venue</p>
        </div>

        <div>
            <div className="flex flex-col gap-24 mt-10">
                <div className="flex flex-row gap-40">
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
                        <p className="text-sm">Event Type</p>
                        <select
                        className="bd rounded-lg p-2 w-80 outline-0"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        >
                        <option value="Marriage Contract Ceremony">Marriage Contract Ceremony</option>
                        <option value="Wedding Reception">Wedding Reception</option>
                        <option value="Marriage Contract + Wedding Reception">Marriage Contract + Wedding Reception</option>

                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm">Estimated Guest</p>

                    <div className="flex flex-row gap-40 items-center">
                        <input
                        className="bd rounded-lg p-2 w-50 outline-0"
                        type="number"
                        value={guestCount < 0 ? 0 : guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        placeholder="Type Guest Count"
                        />
                        {guestCount > 0 ? 
                        <button className="button1 rounded-lg" onClick={() => setToggleDisplayVenue(true)}>See Available Venues</button> :
                        <p className="text-xs w-60 text-red-400">* Final prices may vary based on your estimated guest count quition.</p>}
                    </div>
                </div>



            </div>

            {/* Venue Container */}
            
            <div className="flex flex-row wrap">
                {venuesError ? <div className="text-red-600">{String(venuesError)}</div> : null}
                {venuesLoading ? 
                    <LoadingSkeleton /> : 
                    venueRows.map((v, k) => 
                        <VenueBox key={k}
                        v={v}
                        selectedVenue={venue}
                        setVenue={setVenue}
                        guestCount={guestCount} />
                    )
                }
            </div>

        </div>

      </div>
      <div>
        <div className="flex flex-row justify-end gap-8">
            <button
            className="button1 w-50 rounded-lg" 
            onClick={onBack}>Back</button>
            <button
            className="button2 w-50 rounded-lg"
            >Next</button>
        </div>
      </div>
    </div>
  );
}