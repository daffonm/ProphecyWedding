"use client"

import { useAuth } from "@/context/AuthContext"
import { useDb } from "@/context/DbContext"
import { useCollection } from "@/hooks/useCollection"

import {useState, useMemo} from "react"
import { useRouter } from "next/navigation"

import LoadingSkeleton from "@/components/LoadingSkeleton"
import { ArrowIcon } from "@/components/sub-components/ArrowButton"


import { writeBatch, doc } from "firebase/firestore"; // Import writeBatch

const accounts = [
    {name : "Admin", email:"admin10@gmail.com", password:"666666",},
    {name : "Customer", email:"daffon.salman@gmail.com", password:"666666",},
    {name : "Vendor", email:"vendor10@gmail.com", password:"666666",},
]

export default function DevTools({}) {

    const router = useRouter()
    const { user, authLoading, login, loading, logout } = useAuth()
    const {colRef, where, orderBy, query, setDoc, serverTimestamp} = useDb()

    // const switchAccount
    const [toggleMenu, setToggleMenu] = useState(false)

    const vendorQ = useMemo(() => {
        return () => query(colRef("vendor_assignments"));
      }, [colRef, query, orderBy]);
    const {
        rows: assignments,
        loading: vendorsLoading,
        error: vendorsError,
      } = useCollection(vendorQ, [], { enabled: true });
    
    

    const handleLogin = async (email, password, ref) => {
        if (user) return
        
        try {
            await login(email, password)
            router.push(ref || "/")
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }



    const acceptAllVendorAssignments = async (vendorAssignments) => {
    if (!vendorAssignments || vendorsLoading || vendorsError) return;
        console.log("Accepting all vendor assignments...");
        console.log(vendorAssignments)
    try {
        // Use Promise.all to handle all vendor updates at once
        const updatePromises = vendorAssignments.map((v) => {
            // Only process vendor assignments with "requested" status
            const vendorUpdatePromises = v.assigned_vendors.map((av) => {
                console.log(av)
             
                    return setDoc(
                        "vendor_assignments", 
                        v.id, 
                        {
                            assigned_vendors: v.assigned_vendors.map((vendor) => 
                                vendor.vendor_key === av.vendor_key
                                    ? { ...vendor, assignment_status: "accepted" }
                                    : vendor
                            ),
                            updated_at: serverTimestamp(),
                        }, 
                        { merge: true }
                    );
             
            }).filter(Boolean); // Remove null values

            return Promise.all(vendorUpdatePromises);
        });

        // Wait for all updates to finish
        await Promise.all(updatePromises);
        console.log("All vendor assignments accepted.");
    } catch (error) {
        console.error("Error accepting vendor assignments:", error);
    }
};




    const devTools = [
        {
            name : "Login As Admin",
            handle : () => handleLogin(accounts[0].email, accounts[0].password, "/admin-dashboard"),
        },
        {
            name : "Login As Customer",
            handle : () => handleLogin(accounts[1].email, accounts[1].password),
        },
        {
            name : "Login As Vendor (Harmony Entertainment)",
            handle : () => handleLogin(accounts[2].email, accounts[2].password, "/vendor-hub") ,
        },
        {
            name : "Logout User",
            handle : () => handleLogout(),
        },

        {
            name : "Accept All Vendor Assignments",
            handle : () => acceptAllVendorAssignments(assignments),
            cls: "mt-8"
        },

        {
            name : "Inject Seed",
            handle : () => router.push("/dev/seed"),
            cls: "mt-8"
        },

    ]

    return (
        <div className={`fixed left-0 bottom-20 ml-4 bd-4 bg-black ${!toggleMenu ? "rounded-full" : "rounded-xl"}`}>
            {!toggleMenu ? 
                <button
                className="w-15 h-15 z-1 p-4 flex flex-row justify-center items-center rounded-full"
                onClick={() => setToggleMenu(true)}
                >
                    <img className="w-full h-full" src="/icons/icons8-tool-48.png" alt="" />
                  
                </button> :




                <div className="rounded-xl w-80 h-100 p-4 flex flex-col">
                    <button
                    className="flex flex-row gap-2 items-center mb-4"
                    onClick={() => setToggleMenu(false)}
                    >
                        <ArrowIcon cls={"w-5 h-5"} color="white" />
                        <p className=" text-white">Dev Tools</p>
                    </button>

                    <div className="h-full overflow-y-scroll no-scrollbar flex flex-col">
                        {devTools.map((d, i) => 
                            <button
                            key={i}
                            onClick={d.handle}
                            className={`text-gray-300  border-b border-gray-500 p-2 pb-3 text-start pl-4 
                            hover:bg-gray-500 hover:pl-12
                            transition-all duration-200 ${d.cls && d.cls}`}
                            >
                                {d.name}
                            </button>

                        )}
                    </div>
                </div>
            }

        </div>
    )
    
}