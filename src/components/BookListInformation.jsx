import ArrowButton from "./sub-components/ArrowButton"
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { useDoc } from "@/hooks/useDoc";


import {useState, useMemo} from "react"
import StatusPill from "./StatusPill";




export default function BookListInformation({b, onClose}) {

  
    const { query, where, colRef, limit } = useDb();

    const reservationName = b.customer_info?.reservation_name;
    const primaryContactNumber = b.customer_info?.primary_contact_number;

    const packageName = b.package_info?.package_name;
    const date = b.location_date_info?.date;

    const venueId = b.location_date_info?.venue;
    const venueQ = useMemo(() => {
        return () => query(colRef("Venues"), where("id", "==", venueId), limit(1));
    }, [colRef, query, venueId]);
    const {rows: venueRows, loading: venueLoading, error: venueError} = useCollection(venueQ, [], {enabled: Boolean(venueId)});
    
    const [venue] = venueRows;
    const venueName = venue?.name || "";
    const venueAddress = venue?.address || "";

    const guestCount = b.location_date_info?.guest_count;

    const brideName = b.customer_info?.bride_name;
    const groomName = b.customer_info?.groom_name;

    const weddingType = b.location_date_info?.wedding_type;


    const bookingStatus = b.bookingStatus;
    const updatedAt = b.updatedAt || b.createdAt;

    const paymentSystem = b?.payment_info?.payment_system;
    const paymentMethod = b?.payment_info?.payment_method;

    // const invoice = useDoc
    const invQuery = useMemo(() => {
        return () => query(colRef("Invoices"), where("booking_id", "==", b.id))
    }, [colRef, query, b.id]);
    const { rows: invoices, loading: invLoading, error: invError } = useCollection(invQuery, [], { enabled: Boolean(b.id) })
    const [invoice] = invoices

    const handleInvoice = () => {

        if (!invoice) return
        if (invLoading || invError) return

        window.open(`/invoices/${invoice?.id}`, "_blank")
    }


    return (
        <div className="p-2 pb-14">
            <div className="flex flex-row gap-4 items-center mb-10">
                <ArrowButton onClick={onClose} cls="h-7 w-7"/>
                <p className="text-xl bold">{packageName}</p>

            </div>
            <div className="p-8 bd-6 rounded-xl">
                <div>
                    <p className="text-sm">a Wedding Ceremonial of</p>
                    <h1 className="section-title text-3xl pl-4">{`${groomName} & ${brideName}`}</h1>
                </div>

                <div>
                    <p className="text-sm mt-16">Reserved by</p>
                    <div className="flex flex-row items-center gap-6">
                        <p className="bold">{reservationName}</p>
                        <p className="text-sm">{`(${primaryContactNumber})`}</p>
                    </div>
                   
                </div>

                <div>
                    <p className="text-sm mt-8">Event will be held on</p>
                    <div className="flex flex-row items-center gap-6">
                        <p className="bold">{date}</p>
                        {/* <p className="text-sm">{`(${primaryContactNumber})`}</p> */}
                    </div>
                   
                </div>



                <div className="flex flex-row justify-between mt-16">
                    <div className="flex flex-col gap-8">
                            <div className="">
                                <p className="text-sm">Wedding type</p>
                                <p className="bold">{weddingType}</p>
                            </div>



                            <div>
                                <p className="text-sm">Total estimated guest</p>
                                <div className="flex flex-row items-center gap-6">
                                    <p className="bold">{guestCount}</p>
                                    {/* <p className="text-sm">{`(${primaryContactNumber})`}</p> */}
                                </div>
                            </div>

                    </div>

                    <div>
                        <p className="text-sm">Venue Location</p>
                        <div className="bg-gray-500 w-75 h-60"></div>
                        <div className="w-75">
                            <p className="bold">{venue?.name}</p>
                            <p className="text-xs">{venue?.address}</p>
                        </div>
                    </div>
                   
                </div>

                <div className="mt-16 flex flex-col gap-8">
                    <div>
                        <p className="text-sm">Wedding Package</p>
                        <p className="bold">{packageName}</p>
                    </div>

                    <div>
                        <p className="text-sm">Include List of service / product</p>
                        {b.package_info?.selected_services.map((s, i) => 
                            <p key={i} className="bold">{s.name}</p>
                           )}
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-8">
                    <div>
                        <p className="text-sm">Payment System</p>
                        <p className="bold">{paymentSystem}</p>
                    </div>

                    <div>
                        <p className="text-sm">Payment Method</p>
                        <p className="bold">{paymentMethod}</p>
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-8">
                    <div>
                        <p className="text-sm">Booking Status</p>
                        <StatusPill  statusLabel={bookingStatus}/>
                    </div>


                    {bookingStatus === "Payment Due" &&
                        <div>
                            <button onClick={handleInvoice}>See Invoice</button>
                            <button>Confirm Payment</button>
                        </div>
                    
                    }


                    
                </div>

            </div>

        </div>
    )
}