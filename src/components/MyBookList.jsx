"use client";
import  { useEffect, useState, useMemo } from "react";

import LoadingSkeleton from "./LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";

import CustomerBookingCard from "./CustomerBookingCard";
import BookListInformation from "./BookListInformation";

function formatDateMaybe(v) {
  // kalau Firestore Timestamp: v?.toDate()
  try {
    if (!v) return "-";
    if (typeof v?.toDate === "function") {
      return v.toDate().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    // kalau string "YYYY-MM-DD"
    if (typeof v === "string") return v;
    return "-";
  } catch {
    return "-";
  }
}


export default function MyBookList() {
  const { user, loading: authLoading } = useAuth();

  const {db, query, orderBy, serverTimestamp, colRef, where} = useDb();

  const enabled = Boolean(user?.uid);

  const bookQuery = useMemo(() => {
    return () => query(colRef("Bookings"), orderBy("createdAt", "desc"), where("customer_id", "==", user.uid))
  }, [colRef, orderBy, query]);

  const {
    rows: bookings,
    loading,
    error,
  } = useCollection(bookQuery, [], { enabled });

 
  const [toggleBook, setToggleBook] = useState(null)


  if (authLoading) return <LoadingSkeleton />;
  if (!user) {
    return (
      <div>
        <h2 className="text-lg font-semibold">My BookList</h2>
        <p className="mt-2 text-sm text-gray-600">Silakan login untuk melihat booking kamu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-scroll h-168">
    {loading ? <LoadingSkeleton /> :
    !toggleBook? 
      <div className="p-4">

          <div>
            <h2 className="text-lg font-semibold">My BookList</h2>
            <p className="mt-1 text-sm text-gray-600">
              Daftar booking yang pernah kamu buat.
            </p>
          </div>

          <div className="flex flex-col gap-8 mt-8">
           
            {bookings.length === 0 ? (
              <div className="text-sm text-gray-500">Belum ada booking.</div>) :
              bookings.map((b) => (
                <CustomerBookingCard key={b.id} b={b} toggleDetail={() => setToggleBook(b.id)}/>
              ))}
            
          </div>

          {error && <div className="text-red-600">{error}</div>}
      </div>

     
        :
        <BookListInformation b={bookings.find((b) => b.id === toggleBook)} onClose={() =>{
          setToggleBook(null)
        }}/>  
      }
      
    </div>
  );
}
