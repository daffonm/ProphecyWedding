"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import Overlay from "@/components/Overlay";
import BookingInformation from "./BookingInformation";
import StatusPill from "@/components/StatusPill";

const STATUS = ["All Bookings", "Pending", "Accepted", "On Project", "Cancelled"];
const MODES = ["List", "Calendar"];


//  Helpers
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

function ListItem ({ b , handleSelect, selected}) {

    const name = b.customer_info?.name || "-";
    const phone = b.customer_info?.phone || "-";
    const venue = b.location_date_info?.venue || "-";
    const date = formatDate(b.location_date_info?.date);
    const pkg = b.package_info?.packageList || "-";

    return (
        <button className="flex flex-row items-center gap-4 p-2 rounded-xl glassmorphism-pop w-full h-16 overflow-hidden" 
        onClick={() => handleSelect(b.id)}>
            <div className="flex flex-col items-baseline justify-start w-20 overflow-clip">
                <p className="text-xs">Booking ID</p>
                <p>{b.id}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-14">
                <p className="text-xs">Name</p>
                <p>{name}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-24 overflow-hidden">
                <p className="text-xs">Date</p>
                <p>{date}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-20 h-full">
                <p className="text-xs">Status</p>
                <StatusPill status={b.bookingStatus} />
            </div>
            <div className="flex flex-col items-baseline justify-start">
                <p>{formatTimestamp(b.createdAt)}</p>
            </div>
            {/* <div>
                <Image src="icons/icons8-right.svg" width={10} height={10} alt="arrow-right" />
            </div> */}
        </button>
    )
}

// Pop Up Components
function RejectConfirmation ({onClose, getInput, onConfirm}) {
  return (
    <div>
      <div>
        <h2>Reject This Booking?</h2>
      </div>
      <div>
        <input type="text" name="reason" id="1" onChange={(e) => getInput(e.target.value)}/>
        <div>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default function BookingLists({
  bookings = [],
  usersById = {},
  loading = false,
  error = null,
  action
}) {
  const [activeStatus, setActiveStatus] = useState("All Bookings");
  const [activeMode, setActiveMode] = useState("List");

  /**
   * STEP 1
   * Hanya booking yang SUDAH completed (draft selesai)
  */
 const completedBookings = useMemo(() => {
    return bookings.filter((b) => b.bookingCompleted === true);
  }, [bookings]);

  /**
   * STEP 2
   * Filter berdasarkan status
   */
  const filteredBookings = useMemo(() => {
    if (activeStatus === "All Bookings") return completedBookings;
    return completedBookings.filter(
      (b) => (b.bookingStatus || "") === activeStatus
    );
  }, [completedBookings, activeStatus]);
  
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const handleSelectBooking = (id) => {
    setSelectedBooking(id);
  };
  const findBookingById = (id) => {
    return bookings.find((b) => b.id === id);
  };

  // Pop Ups
  const [togglePopUp, setTogglePopUp] = useState("")
  const [popUpProps, setPopUpProps] = useState({})
  const [rejectInput, setRejectInput] = useState("")
  const popUps = [
    { name: "RejectConfirmation", 
      component : RejectConfirmation, 
      props : { 
        onClose : () => setTogglePopUp(""),
        getInput : setRejectInput,
        onConfirm : () => {
          action.rejectBooking(selectedBooking, rejectInput)
          setTogglePopUp("")
        }
      }}
  ]

  const ActivePopUp = popUps.find((p) => p.name === togglePopUp)


  return (
    <div className="mt-6 flex flex-row justify-between h-132">
        {/* Left Display */}
        <div className="w-150">
      {/* FILTERs */}
      <div className="flex flex-row gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap mb-4 glassmorphism-pop shadow-dark w-fit rounded-xl">
            {STATUS.map((s) => (
            <button
                key={s}
                className={`px-4 py-2 rounded-xl text-xs ${
                activeStatus === s ? "bg-emerald-500 text-white" : ""
                }`}
                onClick={() => setActiveStatus(s)}
            >
                {s}
            </button>
            ))}
        </div>
        {/* List or Calender View */}
        <div className="flex flex-wrap mb-4 glassmorphism-pop shadow-dark w-fit rounded-xl">
            {MODES.map((m) => (
                <button
                key={m}
                className={`px-4 py-2 rounded-xl text-xs ${
                    activeMode === m ? "bg-emerald-500 text-white" : ""
                }`}
                onClick={() => setActiveMode(m)}
                >
                {m}
                </button>
            )
            )}
        </div>
        

      </div>

      {/* List */}
      <div className="w-full overflow-x-auto flex flex-col gap-4 overflow-y-scroll">
        {loading && (
          <div className="text-sm opacity-80">
            Memuat booking yang sudah disubmit...
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-300">
            Gagal memuat data: {String(error?.message || error)}
          </div>
        )}

        {!loading && !error && filteredBookings.length === 0 && (
          <div className="text-sm opacity-80">
            Tidak ada booking completed dengan status: {activeStatus}
          </div>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
            filteredBookings.map((b) => (
                <ListItem key={b.id} b={b} handleSelect={handleSelectBooking} selected={selectedBooking === b.id} />
            ))
        )}
      </div>
        </div>

        {/* Right Display */}
        { selectedBooking && 
        <BookingInformation
         b={findBookingById(selectedBooking)}
         u={usersById?.[findBookingById(selectedBooking)?.customer_id]}
         setTogglePopUp = {setTogglePopUp}
         /> }

        {/* overlay */}
        { togglePopUp && 
        <Overlay
        isOpen={togglePopUp}
        onClose={() => setTogglePopUp("")}
        contentClassName="absolute top-0 right-0 h-screen bg-white shadow-xl p-4"
        >
            {/* { popUps.find((p) => p.name === togglePopUp)?.component(popUpProps) } */}
            { ActivePopUp && <ActivePopUp.component {...ActivePopUp.props} />}
        </Overlay>
        }
    </div>
  );
}

        {/* //   <table className="min-w-1100px w-full text-sm">
        //     <thead className="text-left opacity-80">
        //       <tr>
        //         <th className="py-2">ID</th>
        //         <th className="py-2">Nama</th>
        //         <th className="py-2">Telepon</th>
        //         <th className="py-2">Venue</th>
        //         <th className="py-2">Tanggal</th>
        //         <th className="py-2">Paket</th>
        //         <th className="py-2">Status</th>
        //         <th className="py-2">Created</th>
        //       </tr>
        //     </thead>

        //     <tbody>
        //       {filteredBookings.map((b) => {
        //         const name = b.customer_info?.name || "-";
        //         const phone = b.customer_info?.phone || "-";
        //         const venue = b.location_date_info?.venue || "-";
        //         const date = formatDate(b.location_date_info?.date);
        //         const pkg = b.package_info?.packageList || "-";

        //         return (
        //           <tr
        //             key={b.id}
        //             className={`border-t border-white/10 ${
        //               onSelectBooking
        //                 ? "cursor-pointer hover:bg-white/5"
        //                 : ""
        //             }`}
        //             onClick={() => onSelectBooking?.(b)}
        //           >
        //             <td className="py-3">{b.id}</td>
        //             <td className="py-3">{name}</td>
        //             <td className="py-3">{phone}</td>
        //             <td className="py-3">{venue}</td>
        //             <td className="py-3">{date}</td>
        //             <td className="py-3">{pkg}</td>
        //             <td className="py-3">
        //               <StatusPill status={b.bookingStatus} />
        //             </td>
        //             <td className="py-3">
        //               {formatTimestamp(b.createdAt)}
        //             </td>
        //           </tr>
        //         );
        //       })}
        //     </tbody>
        //   </table> */}