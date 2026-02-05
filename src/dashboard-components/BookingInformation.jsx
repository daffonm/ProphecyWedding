import { useState, useMemo } from "react";
import Image from "next/image";

import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { useServicesByCodes, useVendorsByServiceCodes } from "@/hooks/useDocsByFields";

import { formatRupiah } from "@/utils/format";
import VendorAssignment from "./VendorAssigment";
import StatusPill from "@/components/StatusPill";
import Overlay from "@/components/Overlay";
import LoadingSkeleton from "@/components/LoadingSkeleton";


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

function stableKey(arr) {
  return (arr || []).filter(Boolean).join("|");
}

// Core Components



export default function BookingInformation ({b, u, onClose, action}) {

    
    const bookingFields = [
        { label: "Reservation Name", value: b.customer_info?.reservation_name || "-", needRevise: false },
        { label: "Groom Name", value: b.customer_info?.groom_name || "-", needRevise: false },
        { label: "Bride Name", value: b.customer_info?.bride_name || "-", needRevise: false },
        { label: "Primary Contact Number", value: b.customer_info?.primary_contact_Number || "-", needRevise: false },
        
        
        { label: "Package", value: b.package_info?.packageList || "-", needRevise: false },
        // { label: "Package", value: b.package_info?.packageList || "-", needRevise: false },
        
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

    const packageQuery =  useMemo(() => {
        return () => query(colRef("Packages"), where("code", "==", b.package_info?.package_code), limit(1))
        }, [colRef, query, getField("Package").value]);
    
    const { 
        rows: packageRows, 
        loading: packageLoading, 
        error: packageError 
    } = useCollection(packageQuery, [], { enabled: Boolean(getField("Package").value) });
    const [pkg] = packageRows;

    const serviceCodes =
        b.package_info?.isCustom
            ? b.package_info?.selected_services
            : pkg?.included_services;

    const {
        rows: servicesRows,
        loading: servicesLoading,
        error: servicesError
        } = useServicesByCodes(serviceCodes || [], { enabled: Boolean(serviceCodes?.length) });


    const assignedVendorsQuery = useMemo(() => {
        return () => query(colRef("vendor_assignments"), where("booking_id", "==", b.id))
        }, [colRef, query, serviceCodes]);

    const {
        rows: assignedVendorsRows,
        loading: assignedVendorsLoading,
        error: assignedVendorsError
        } = useCollection(assignedVendorsQuery, [], { enabled: Boolean(b?.id) });
    const [assignedVendorsRow] = assignedVendorsRows;
    
        
        
    const [toggleConfirmationPopup, setToggleConfirmationPopup] = useState(false);
    const [toggleVendorAssignmentPopup, setToggleVendorAssigmentPopup] = useState(false);
   

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

            {/* Pop Up Layers */}
            <Overlay 
            isOpen={toggleConfirmationPopup}
            onClose={() => setToggleConfirmationPopup(false)}
            contentClassName = {"absolute bg-white w-100 h-full right-0"}
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

            <Overlay
            isOpen={toggleVendorAssignmentPopup}
            onClose={() => setToggleVendorAssigmentPopup(false)}
            contentClassName="absolute bg-white w-285 h-full right-0 overflow-y-scroll p-8"
            >
                <VendorAssignment
                    bookingId={b.id}
                    requiredServiceCodes={serviceCodes || []}   // ✅ array string codes
                    requiredServices={servicesRows || []}       // ✅ array object services
                    eventCity={b.location_date_info?.city || null} // ✅ opsional
                    onClose={() => setToggleVendorAssigmentPopup(false)}
                    />
            </Overlay>

                    

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
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col gap-6">

                            <div>
                                <p className="text-xs">Package Name</p>
                                <p className="text-sm">
                                    {getField("Package").value}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs">Included Services</p>
                                <ul className="pl-2">
                                    { servicesLoading? <LoadingSkeleton /> :
                                        <ul>
                                            {servicesRows.map((s) => (
                                                <li key={s.id ?? s.code} className="text-xs">{s?.label}</li>
                                            ))}
                                        </ul>
                                    }
                                </ul>
                            </div>


                        </div>

                        {assignedVendorsRow && (
                            <div className="border p-4 rounded-xl flex flex-col w-132 justify-between">
                                {assignedVendorsLoading? <LoadingSkeleton /> :
                                    <div className="flex flex-col">
                                        <div>
                                            <h1 className="">Assigned Vendors</h1>
                                                {assignedVendorsRow?.assigned_vendors.map((a) => (
                                                <div key={a?.vendor_key} className="pl-2 flex flex-row justify-between">
                                                    <p className="text-sm">{a?.vendor_name}</p>
                                                    <p className="text-sm">{a?.assignment_status}</p>
                                                </div>
                                                ))}
                                        </div>
                                    </div>
                                }
                            <button
                            onClick={() => setToggleVendorAssigmentPopup(true)}
                            className="button1 w-40 text-sm">Edit Assignments</button>
                            </div>
                        )
                        
                        }
                    </div>

                    {!assignedVendorsRow && 
                    <div className="mt-10">
                        <button
                        onClick={() => setToggleVendorAssigmentPopup(true)}
                        className="button1 w-40 text-sm">Assign a Vendor</button>
                    </div>
                    }

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

