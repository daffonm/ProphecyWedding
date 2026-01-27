import StatusPill from "@/components/StatusPill";

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


export default function BookingInformation ({b, u}) {

    const name = b.customer_info?.name || "-";
    const phone = b.customer_info?.phone || "-";
    const bridegroom = b.customer_info?.bridegroom || "-";
    const bride = b.customer_info?.bride || "-";
    const venue = b.location_date_info?.venue || "-";
    const guestCount = b.location_date_info?.guestCount || "-";
    const date = formatDate(b.location_date_info?.date);
    const pkg = b.package_info?.packageList || "-";

    const paymentSystem = b.payment_info?.payment_system || "-";
    const paymentMethod = b.payment_info?.payment_method || "-";


    console.log(u);


    return (
        <div className="w-110 glassmorphism-pop rounded-xl p-8 h-full overflow-y-scroll">
            {/* Top */}
            <div>
                <h2 className="text-xl">Booking Information</h2>
            </div>
            {/* Container */}
            <div className="flex flex-col gap-8">

                {/* Customer Details */}
                <div>
                    <div>
                        <h3 className="text-lg">Customer Details</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row">
                            <div className="flex flex-col w-100">
                                <p className="text-xs">Email</p>
                                <p>{u.email}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs">Contact</p>
                                <p>{phone}</p>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="flex flex-col w-100">
                                <p className="text-xs">Username</p>
                                <p>{u.username}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reservation Details */}
                <div>
                    <div>
                        <h3 className="text-lg">Reservation Details</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row">
                            <div className="flex flex-col w-100">
                                <p className="text-xs">Reservation Name</p>
                                <p>{name}</p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Bridegroom</p>
                                <p>{bridegroom}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs">Bride</p>
                                <p>{bride}</p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Created At</p>
                                <p>{formatTimestamp(b.createdAt)}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs">Booking Status</p>
                                <StatusPill status={b.bookingStatus} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Package */}
                <div>
                    <div>
                        <h3 className="text-lg">Package List</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col w-100">
                                <p className="text-xs">Package</p>
                                <p>{pkg}</p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Package Details</p>
                                <p>{"-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Location */}
                <div>
                    <div>
                        <h3 className="text-lg">Date & Location</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Location / Venue</p>
                                <p>{venue}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs">Est. Guest Count</p>
                                <p>{guestCount}</p>
                            </div>
                        </div>
                       
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Book for Date</p>
                                <p>{date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div>
                    <div>
                        <h3 className="text-lg">Payment</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs">Payment System</p>
                                <p>{paymentSystem}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs">Payment Method</p>
                                <p>{paymentMethod}</p>
                            </div>
                        </div>
         
                    </div>
                </div>


            </div>

            {/* Action Buttons */}
            <div className="w-full mt-14">
                { b.bookingStatus === "Pending" && (
                    <div className="flex flex-col w-full gap-4">
                        <button className="bg-emerald-500 text-white px-4 py-2 rounded">Accept & Reserve Date</button>
                        <button className="bg-white text-red-500 border border-red-500 px-4 py-2 rounded">Reject This Booking</button>
                    </div>
                )}
            </div>
        </div>
    )
}