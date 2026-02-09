// /mnt/data/page.jsx
"use client";

import { useMemo, useState, useCallback } from "react";

import SideMenu from "@/dashboard-components/SideMenu";

import BookingLists from "@/dashboard-components/BookingLists";
import VendorManagement, { VendorRegistrationList } from "@/dashboard-components/VendorManagement";
import RegisteredVenues from "@/dashboard-components/RegisteredVenues";
import Transaction from "@/dashboard-components/Transaction";

import LoadingSkeleton from "@/components/LoadingSkeleton";

import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { useUsersByIds } from "@/hooks/useUsersByIds";
import { useRouter } from "next/navigation";

import { useChat } from "@/context/ChatContext";

import ChatButton from "@/components/sub-components/ChatButton";

export default function AdminDashboard() {
  const { db, colRef, query, orderBy, serverTimestamp, updateDoc } = useDb();
  const router = useRouter()

  const { user, authLoading, profileLoading, logout } = useAuth();

  const onLogOut = () => {
    // if  (!user) return;
    // if (authLoading || profileLoading) return;

    logout();
    router.push("/");
  }

  // const usersQuery = useMemo(() => {
  //   return () => query(colRef("Users"), orderBy("createdAt", "desc"));
  // }, [colRef, query, orderBy]);
  // const { users, loading: usersLoading, error: usersError } = useCollection(
  //   usersQuery,
  //   [],
  //   { enabled: true }
  // );
  const { openChat, closeChat, openChatToUserId } = useChat()

  const bookingQuery = useMemo(() => {
    return () => query(colRef("Bookings"), orderBy("createdAt", "desc"));
  }, [colRef, query, orderBy]);

  const {
    rows: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useCollection(bookingQuery, [], { enabled: true });

  const customerIds = useMemo(
    () => bookings.map((b) => b.customer_id).filter(Boolean),
    [bookings]
  );

  const { usersById } = useUsersByIds(customerIds, true);

  // ====== ACTION LOADING PER ROW ======
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [actionError, setActionError] = useState(null);

  const setRowLoading = (id, val) =>
    setActionLoadingById((prev) => ({ ...prev, [id]: val }));

  // ====== CORE UPDATE (sesuai struktur Booking kamu) ======
  const patchBooking = useCallback(async (bookingId, patch) => {
    if (!bookingId) return;
    setActionError(null);
    setRowLoading(bookingId, true);

    try {
    //  updateDoc(collection, id, data)
      await updateDoc("Bookings", bookingId, {
        ...patch,
        updatedAt: serverTimestamp(),
      });

    } catch (e) {
      console.error("patchBooking error:", e);
      setActionError(e);
    } finally {
      setRowLoading(bookingId, false);
    }
  }, [db]);

  const patch = useCallback(async (col, id, patch) => {
    if (!id) return;
    setActionError(null);
    setRowLoading(id, true);

    try {
    //  updateDoc(collection, id, data)
      await updateDoc(col, id, {
        ...patch,
        updatedAt: serverTimestamp(),
      });

    } catch (e) {
      console.error(`patch${col} error:`, e);
      setActionError(e);
    } finally {
      setRowLoading(id, false);
    }
  }, [db]);

  // ====== BOOKING ACTIONS: TERIMA / TOLAK / DLL ======
  


  // VENDORS MANAGEMENT ====================================
  const vendorQuery = useMemo(() => {
    return () => query(colRef("Vendors"), orderBy("name", "asc"));
  }, [colRef, query, orderBy]);
  const {
    rows: vendors,
    loading: vendorsLoading,
    error: vendorsError,
  } = useCollection(vendorQuery, [], { enabled: true });
  
  const unregisteredVendor = useMemo(() => {
    return vendors.filter((v) => v.status === "idle");
  }, [vendors]);

  
  // VENUES ====================================
  const venueQuery = useMemo(() => {
    return () => query(colRef("Venues"), orderBy("name", "asc"));
  }, [colRef, query, orderBy]);
  const {
    rows: venues,
    loading: venuesLoading,
    error: venuesError,
  } = useCollection(venueQuery, [], { enabled: true });





  // ====== Side Menus ====== 
  const sideMenu = useMemo(
    () => [
      {
        name: "Booking Lists",
        component: BookingLists,
        props: {
          bookings,
          usersById,
          loading: bookingsLoading,
          error: bookingsError,
          patchBooking
        },
        sub: [
          { name: "Transactions", component: Transaction, props: {patch, bookings}, parent: "Booking Lists" },
        ],
      },
      { name: "Customer Relations", component: null, props: {} },
      { name: "Resource Management", 
        component: VendorManagement, 
        props: {

        },
        sub: [
          { name: "Registered Venues", 
            component: RegisteredVenues, 
            props: {venues, venuesLoading, venuesError}, 
            parent: "Resource Management" },     
          { name: "Vendor Listing", 
            component: VendorRegistrationList, 
            props: {vendors, unregisteredVendor, vendorsLoading, vendorsError, patch}, 
            parent: "Resource Management" },     
        ]},
    ],
    [bookings, usersById, bookingsLoading, bookingsError]
  );

  const [activeMenu, setActiveMenu] = useState("Booking Lists");
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const activeItem = useMemo(() => {
    const parent = sideMenu.find((m) => m.name === activeMenu) || null;
    if (!parent) return null;

    if (activeSubMenu && parent.sub) {
      const sub = parent.sub.find((s) => s.name === activeSubMenu) || null;
      if (sub) return sub;
    }

    return parent;
  }, [sideMenu, activeMenu, activeSubMenu]);

  const ActiveMenuComponent = activeItem?.component || null;
  const activeMenuProps = activeItem?.props || {};
  const activeTitle = activeSubMenu ? activeSubMenu : activeMenu;

  return (
    <section className="gradient-1 p-4 h-screen"> 
      <div className="glassmorphism h-full flex">
        <SideMenu
          activeMenu={activeMenu}
          activeSubMenu={activeSubMenu}
          setActiveMenu={setActiveMenu}
          setActiveSubMenu={setActiveSubMenu}
          sideMenu={sideMenu}
          logOut = {onLogOut}
        />

        <div className="p-4 w-full">
          <div className="flex flex-row justify-between items-baseliner pr-4 pl-4">
            <div className="flex flex-col">
              <p className="">Welcome Back, Admin!</p>
              <h1 className="text-4xl font-bold transition-all duration-300 ease-in-out">
                {activeTitle}
              </h1>
            </div>

            <div>
              <ChatButton />
            </div>

          </div>

          {ActiveMenuComponent ? (
            <div className="transition-all duration-300 ease-in-out">
              <ActiveMenuComponent {...activeMenuProps} />
            </div>
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      </div>
    </section>
  );
}
