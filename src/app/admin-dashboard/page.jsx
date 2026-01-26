"use client";
import { useMemo, useState } from "react";

import SideMenu from "@/dashboard-components/SideMenu";
import BookingLists from "@/dashboard-components/BookingLists";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// Import Db
import { useDb } from "@/context/DbContext";
// Import Hooks
import { useCollection } from "@/hooks/useCollection";


export default function AdminDashboard() {

    const { colRef, query, orderBy } = useDb();

    // Bookings
    const bookingQuery = useMemo(() => {
        return () => query(colRef("Bookings"), orderBy("createdAt", "desc"));
    }, [colRef, query, orderBy]);

    const {
        rows: bookings,
        loading: bookingsLoading,
        error: bookingsError,
    } = useCollection(bookingQuery, [], { enabled: true });
    


    // Active Menus
    const sideMenu = [
        { name: "Booking Lists", component: BookingLists, props: { bookings, loading: bookingsLoading, error: bookingsError } },
        { name: "Customer Relations", component: null, current: false },
        { name: "Vendors & Services", component: null, current: false },
    ];

    const [activeMenu, setActiveMenu] = useState("Booking Lists");
    const ActiveMenuComponent = sideMenu.find((menu) => menu.name === activeMenu)?.component;
    const activeMenuProps = sideMenu.find((menu) => menu.name === activeMenu)?.props || {};


    return (
        <section className="gradient-1 p-8 h-screen">
            
            <div className="glassmorphism h-full flex">
                <SideMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} sideMenu={sideMenu} />
                <div className="p-4 w-full">
                        {/* Display Top */}
                    <div className="flex flex-row justify-between items-baseliner pr-4 pl-4">
                        <div className="flex flex-col">
                            <p className="">Welcome Back, Admin!</p>
                            <h1 className="text-4xl font-bold">{activeMenu}</h1>
                        </div>
                        <div>
                            <div>Profile Icon</div>
                        </div>
                    </div>

                    {/* Display Container */}
                    {ActiveMenuComponent ? <ActiveMenuComponent {...activeMenuProps} /> : <LoadingSkeleton />}


                </div>
            </div>
        </section>
    );
}