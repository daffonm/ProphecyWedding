import { useState, useMemo } from "react";
import Image from "next/image";

import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";

import { formatRupiah } from "@/utils/format";
import StatusPill from "@/components/StatusPill";
import Overlay from "@/components/Overlay";


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


export default function BookingInformation ({b, u, onClose, action}) {

    
    const bookingFields = [
        { label: "Reservation Name", value: b.customer_info?.reservation_name || "-", needRevise: false },
        { label: "Groom Name", value: b.customer_info?.groom_name || "-", needRevise: false },
        { label: "Bride Name", value: b.customer_info?.bride_name || "-", needRevise: false },
        { label: "Primary Contact Number", value: b.customer_info?.primary_contact_Number || "-", needRevise: false },
        
        
        { label: "Package", value: b.package_info?.packageList || "-", needRevise: false },
        
        { label: "Venue", value: b.location_date_info?.venue || "-", needRevise: false },
        { label: "Guest Count", value: b.location_date_info?.guest_count || "-", needRevise: false },
        { label: "Wedding Type", value: b.location_date_info?.wedding_type || "-", needRevise: false},
        
        { label: "Date", value: b.location_date_info?.date, needRevise: false },
        { label: "Payment System", value: b.payment_info?.payment_system || "-", needRevise: false },
        { label: "Payment Method", value: b.payment_info?.payment_method || "-", needRevise: false },
        { label: "Estimated Total Price", value: b?.estiamated_total_price || "-", needRevise: false },
    ]
    const getField = (field) => bookingFields.find((f) => f.label === field) || "field not found";

    const { query, where, colRef, limit } = useDb();
    const venueQuery = useMemo(() => {
        return () => query(colRef("Venues"), where("id", "==", getField("Venue").value), limit(1));
    }, [colRef, query, getField("Venue").value]);
    const { rows: venueRows, loading: venueLoading, error: venueError } = useCollection(venueQuery, [], { enabled: Boolean(getField("Venue").value) });
    const [venue] = venueRows;  
  
    const [toggleConfirmationPopup, setToggleConfirmationPopup] = useState(false);
   

    function VenueBox({v}) {
       
        return (
            <div
              className={`border rounded-xl overflow-hidden bg-white flex flex-col justify-between}`}
            >
              {/* ImageBox placeholder */}
              <div className="bg-gray-200 h-32 w-full" />
        
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h2 className="font-semibold">{v?.name}</h2>
                  <p className="text-xs text-gray-600 line-clamp-2">{v?.address}</p>
                </div>
        
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-gray-500">Base Price</p>
                    <div className="font-semibold">{formatRupiah(v?.base_price)}</div>
                  </div>
        
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500">Capacity</p>
                    <div className="text-sm font-semibold">{v?.capacity}</div>
                  </div>
                </div>
        
              </div>
            </div>
        )
    } 

    function ConfirmationPopUp({title, text, subtext = "", onClose, onConfitrm}) {
        return (
            <div className="p-8">
                <div className="flex flex-col justify-center items-center gap-2">
                    <h2>{title}</h2>
                    <p className="text-sm">{text}</p>
                    <p className="text-xs">{subtext}</p>
                </div>
                <div className="flex flex-row justify-center gap-4 mt-4">
                    <button
                    onClick={onClose}
                    >Cancel</button>
                    <button
                    onClick={onConfitrm}
                    >Confirm</button>
                </div>
            </div>
        )
    }
    


    return (
        <div className="">

            {/* Pop Up Layer */}
            <Overlay 
            isOpen={toggleConfirmationPopup}
            onClose={() => setToggleConfirmationPopup(false)}
            contentClassName = {"w-full h-full bg-white"}
            ><ConfirmationPopUp
                title = {"Set up Invoice"}
                text = {"Are you sure you want to set up invoice for this booking?"}
                subtext = {" *this will mark the booking status into Quotation"}
                onClose = {() => setToggleConfirmationPopup(false)}
                onConfitrm = {() => {
                    action.updateBookingStatus(b.id, "Quotation")
                    action.updateBooking(b.id, { invoice_setup: true })
                    setToggleConfirmationPopup(false)}}
                    /></Overlay>

            <div className="flex flex-row gap-4 w-full">
                <button onClick={onClose}>X</button>
                <div className="flex flex-row justify-between w-full">
                    <div className ="flex flex-row gap-8">
                        <p>{b.id}</p>
                        <p>{getField("Package").value}</p>
                        <p>{getField("Reservation Name").value}</p>
                        <p>{formatDate(getField("Date").value)}</p>
                    </div>
                    <div className="flex flex-row gap-4">
                        <StatusPill statusLabel={b.bookingStatus} />
                        <p>{formatTimestamp(b.createdAt)}</p>
                    </div>
                </div>
            </div>

            {/* Component Bubbles */}
            <div className="flex flex-col gap-2">

                <div className="glassmorphism-pop p-6 rounded-xl">
                    <div>
                        <h2>Reservation Details</h2>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-6">

                        <div>
                            <p className="text-xs">Booking Id</p>
                            <p className="text-sm">
                                {b.id}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs">Reservation Name</p>
                            <p className="text-sm">
                                {getField("Reservation Name").value}
                            </p>
                        </div>

                        <div className="flex flex-row gap-60">
                            <div>
                                <p className="text-xs">Groom Name</p>
                                <p className="text-sm">
                                    {getField("Groom Name").value}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs">Bride Name</p>
                                <p className="text-sm">
                                    {getField("Bride Name").value}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                <div className="glassmorphism-pop p-6 rounded-xl">
                    <div>
                        <h2>Package Information</h2>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-6">

                        <div>
                            <p className="text-xs">Package Name</p>
                            <p className="text-sm">
                                {getField("Package").value}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs">Included Services</p>
                            <p className="text-sm">
                                {getField("Reservation Name").value}
                            </p>
                        </div>

                        <div className="mt-10">
                            <button className="button1 w-40 text-sm">Assign a Vendor</button>
                        </div>

                    </div>

                </div>

                <div className="glassmorphism-pop p-6 rounded-xl">
                    <div>
                        <h2>Location and Date Information</h2>
                    </div>
                    {/* Content */}
                    <div className="flex flex-row justify-between">

                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Book for Date</p>
                                <p className="text-sm">
                                    {formatDate(getField("Date").value)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs">Estimated Guest</p>
                                <p className="text-sm">
                                    {getField("Guest Count").value}
                                </p>
                            </div>

                            <div className="flex flex-row gap-60">
                                <div>
                                    <p className="text-xs">Wedding Type</p>
                                    <p className="text-sm">
                                        {getField("Wedding Type").value}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs">Requested Venue</p>
                            {!venueError && !venueLoading && 
                            <VenueBox v={venue}/>
                            }
                        </div>

                    </div>

                </div>

                <div className="glassmorphism-pop p-6 rounded-xl">
                    <div>
                        <h2>Payment Details</h2>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-6">
                        
                        <div className="flex flex-row gap-60">
                            <div>
                                <p className="text-xs">Payment System</p>
                                <p className="text-sm">
                                    {getField("Payment System").value}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs">Payment Method</p>
                                <p className="text-sm">
                                    {getField("Payment Method").value}
                                </p>
                            </div>

                        </div>
                        
                        <div>
                            <div>
                                <p className="text-xs">Estimated Total Price</p>
                                <p className="text-sm">
                                    {formatRupiah(getField("Estimated Total Price").value)}
                                </p>
                            </div>
                            <div className="flex flex-row gap-8 mt-14">
                                <button
                                onClick={() => setToggleConfirmationPopup(true)}
                                className="button1"
                                >Suggest a Revision</button>
                                <button
                                onClick={() => setToggleConfirmationPopup(true)}
                                className="button2"
                                >Set up Invoice</button>

                            </div>
                        </div>
                 </div>

                </div>

                { b?.invoice_setup && 
                    <div className="glassmorphism-pop p-6 rounded-xl">
                    <div>
                        <h2>Payment Details</h2>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-6">
                        
                        <div className="flex flex-row gap-60">
                            <div>
                                <p className="text-xs">Payment System</p>
                                <p className="text-sm">
                                    {getField("Payment System").value}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs">Payment Method</p>
                                <p className="text-sm">
                                    {getField("Payment Method").value}
                                </p>
                            </div>

                        </div>
                        
                        <div>
                            <div>
                                <p className="text-xs">Estimated Total Price</p>
                                <p className="text-sm">
                                    {formatRupiah(getField("Estimated Total Price").value)}
                                </p>
                            </div>
                            <button
                            onClick={() => setToggleConfirmationPopup(true)}
                            className="button1"
                            >Set up Invoice</button>
                        </div>
                 </div>

                </div>}

            </div>
        </div>
    )
}

// export default function BookingInformation ({b, u, setTogglePopUp}) {

//     const name = b.customer_info?.name || "-";
//     const phone = b.customer_info?.phone || "-";
//     const bridegroom = b.customer_info?.bridegroom || "-";
//     const bride = b.customer_info?.bride || "-";
//     const venue = b.location_date_info?.venue || "-";
//     const guestCount = b.location_date_info?.guestCount || "-";
//     const date = formatDate(b.location_date_info?.date);
//     const pkg = b.package_info?.packageList || "-";

//     const paymentSystem = b.payment_info?.payment_system || "-";
//     const paymentMethod = b.payment_info?.payment_method || "-";


//     console.log(u);


//     return (
//         <div className="w-110 glassmorphism-pop rounded-xl p-8 h-full overflow-y-scroll">
//             {/* Top */}
//             <div>
//                 <h2 className="text-xl">Booking Information</h2>
//             </div>
//             {/* Container */}
//             <div className="flex flex-col gap-8">

//                 {/* Customer Details */}
//                 <div>
//                     <div>
//                         <h3 className="text-lg">Customer Details</h3>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-row">
//                             <div className="flex flex-col w-100">
//                                 <p className="text-xs">Email</p>
//                                 <p>{u.email}</p>
//                             </div>
//                             <div className="flex flex-col items-end">
//                                 <p className="text-xs">Contact</p>
//                                 <p>{phone}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-row">
//                             <div className="flex flex-col w-100">
//                                 <p className="text-xs">Username</p>
//                                 <p>{u.username}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Reservation Details */}
//                 <div>
//                     <div>
//                         <h3 className="text-lg">Reservation Details</h3>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-row">
//                             <div className="flex flex-col w-100">
//                                 <p className="text-xs">Reservation Name</p>
//                                 <p>{name}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Bridegroom</p>
//                                 <p>{bridegroom}</p>
//                             </div>
//                             <div className="flex flex-col items-end">
//                                 <p className="text-xs">Bride</p>
//                                 <p>{bride}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Created At</p>
//                                 <p>{formatTimestamp(b.createdAt)}</p>
//                             </div>
//                             <div className="flex flex-col items-end">
//                                 <p className="text-xs">Booking Status</p>
//                                 <StatusPill status={b.bookingStatus} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 {/* Package */}
//                 <div>
//                     <div>
//                         <h3 className="text-lg">Package List</h3>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col w-100">
//                                 <p className="text-xs">Package</p>
//                                 <p>{pkg}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Package Details</p>
//                                 <p>{"-"}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Date and Location */}
//                 <div>
//                     <div>
//                         <h3 className="text-lg">Date & Location</h3>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Location / Venue</p>
//                                 <p>{venue}</p>
//                             </div>
//                             <div className="flex flex-col items-end">
//                                 <p className="text-xs">Est. Guest Count</p>
//                                 <p>{guestCount}</p>
//                             </div>
//                         </div>
                       
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Book for Date</p>
//                                 <p>{date}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Payment */}
//                 <div>
//                     <div>
//                         <h3 className="text-lg">Payment</h3>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-row justify-between">
//                             <div className="flex flex-col">
//                                 <p className="text-xs">Payment System</p>
//                                 <p>{paymentSystem}</p>
//                             </div>
//                             <div className="flex flex-col items-end">
//                                 <p className="text-xs">Payment Method</p>
//                                 <p>{paymentMethod}</p>
//                             </div>
//                         </div>
         
//                     </div>
//                 </div>


//             </div>

//             {/* Action Buttons */}
//             <div className="w-full mt-14">
//                 { b.bookingStatus === "Pending" && (
//                     <div className="flex flex-col w-full gap-4">
//                         <button className="bg-emerald-500 text-white px-4 py-2 rounded">Accept & Reserve Date</button>
//                         <button className="bg-white text-red-500 border border-red-500 px-4 py-2 rounded"
//                         onClick={() => setTogglePopUp("RejectConfirmation")}
//                         >
//                         Reject This Booking</button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }