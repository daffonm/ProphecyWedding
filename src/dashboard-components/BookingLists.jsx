"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import Overlay from "@/components/Overlay";
import BookingInformation from "./BookingInformation";
import StatusPill from "@/components/StatusPill";

import { bookingStatuses } from "@/utils/status";
import LoadingSkeleton from "@/components/LoadingSkeleton";
// const STATUS = ["All Bookings", "Pending", "Accepted", "On Project", "Cancelled"];

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

function ListItem ({ b , handleSelect, }) {

    const name = b.customer_info?.reservation_name || "-";
    const date = formatDate(b.location_date_info?.date);
    const pkg = b.package_info?.packageList || "-";
 

    return (
        <button className="flex flex-row items-center gap-4 p-2 rounded-xl bd-2 w-full h-12 overflow-hidden" 
        onClick={() => handleSelect(b.id)}>
            <div className="flex flex-col items-baseline justify-start w-20 overflow-clip">
                <p className="text-xs">Booking ID</p>
                <p className="text-sm">{b.id}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
                <p className="text-xs">Package</p>
                <p className="text-sm">{pkg}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-24 overflow-clip">
                <p className="text-xs">Name</p>
                <p className="text-sm">{name}</p>
            </div>
            <div className="flex flex-col items-baseline justify-start w-24 overflow-clip">
                <p className="text-xs">Date</p>
                <p className="text-sm">{date}</p>
            </div>
            <div className="flex flex-col items-center justify-center w-20 h-full">
                <StatusPill statusLabel={b.bookingStatus} />
            </div>
            <div className="flex flex-col items-baseline justify-start">
                <p className="text-sm">{formatTimestamp(b.createdAt)}</p>
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
  patchBooking,
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
  
  
  const findBookingById = (id) => {
    return bookings.find((b) => b.id === id);
  };
  
  
  const updateBookingStatus = (id, status) => {
    patchBooking(id, { bookingStatus: status });
  };
  
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toggleAutoReview, setToggleAutoReview] = useState(true);
  const onListSelected = (id) => {
    setSelectedBooking(id);
    if (toggleAutoReview) findBookingById(id).bookingStatus === "Pending" && updateBookingStatus(id, "On Review");
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
    <div className="mt-6 flex flex-row justify-between h-full px-4">
       
      <div className="w-full h-120">
      {/* FILTERs */}
      <div className="flex flex-row w-full justify-between">
        {/* Status Filter */}
        <div className="flex flex-wrap mb-4 glassmorphism-pop shadow-dark w-fit rounded-xl p-1">
            <button
                className={`px-4 py-2 rounded-xl text-xs ${
                activeStatus === "All Bookings" ? "bg-emerald-500 text-white" : ""
                }`}
                onClick={() => setActiveStatus("All Bookings")}
            >
                All Bookings
            </button>
            {bookingStatuses.map((s, id) => (
            <button
                key={id}
                className={`px-4 py-2 rounded-xl text-xs ${
                activeStatus === s.label ? `${s.color} ${s.textColor}` : ""
                }`}
                onClick={() => setActiveStatus(s.label)}
            >
                {s.label}
            </button>
            ))}
        </div>
        {/* List or Calender View */}
        <div className="flex flex-wrap mb-4 glassmorphism-pop shadow-dark w-fit rounded-xl p-1">
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

      {/* List Container*/}
      <div className="w-full overflow-x-auto flex flex-col gap-2 overflow-y-scroll px-2 py-2 glassmorphism shadow-dark rounded-xl h-full">
        <div className="flex flex-row gap-2 items-center p-2">
          <input type="checkbox" name="autoRev" id="1"
          className="w-3 h-3"
          onChange={(e) => setToggleAutoReview(e.target.checked)}
          checked = {toggleAutoReview}
          />
          <p className="text-xs">Auto set status on review upon checking</p>
        </div>
        {loading && (
          <LoadingSkeleton />
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

        {!selectedBooking ?
          !loading && !error && filteredBookings.length > 0 && (
              filteredBookings.map((b) => (
                  <ListItem key={b.id} b={b} handleSelect={onListSelected} selected={selectedBooking === b.id} />
              ))
        ) : <BookingInformation 
          b={findBookingById(selectedBooking)} 
          u={usersById[findBookingById(selectedBooking)?.customer_id]}
          onClose= {() => setSelectedBooking(null)}
          />}


      </div>
        </div>

        {/* <Overlay
        onClose={() => setSelectedBooking(null)}
        isOpen={selectedBooking}
        contentClassName = {"w-full h-full bg-white"}
        >
          <BookingInformation 
          b={findBookingById(selectedBooking)} 
          u={usersById[findBookingById(selectedBooking)?.customer_id]}
          onClose= {() => setSelectedBooking(null)}
          />
       
        </Overlay> */}

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