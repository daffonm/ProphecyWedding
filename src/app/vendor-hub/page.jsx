"use client"


import { useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";


import LoadingSkeleton from "@/components/LoadingSkeleton";
import ProductServices from "@/dashboard-components/ProductServices";
import VendorEvent from "@/dashboard-components/VendorEvent";
import DevTools from "../dev/DevTools";

export default function VendorHub({}) {

    const { user, loading, profileLoading, userDoc } = useAuth();
    const { db, colRef, query, where, orderBy, serverTimestamp, updateDoc } = useDb();


    // ===== load list service (optional checkbox)
  console.log(user?.uid)
   
    const vendorQuery = useMemo(() => {
        return () => user?.uid ? query(colRef("Vendors"), where("user_id", "==", user.uid)) : null;
      }, [user?.uid, colRef, query]);
      const {
        rows: vendors,
        loading: vendorsLoading,
        error: vendorsError,
      } = useCollection(vendorQuery, [user?.uid], { enabled: Boolean(user?.uid) });
    const [userVendor] = vendors

//     const assignmentQuery = useMemo(() => {
//     return () => query(colRef("vendor_assignments"));
//   }, [colRef, query]);

//     const {
//         rows: assigmentsRows,
//         loading: assignmentsLoading,
//         error: assignmentsError,
//     } = useCollection(assignmentQueryQuery, [], { enabled: true });
//     const assignment = ass
    const getDataField = () => {
        const dataField = {
            vendorID: userVendor?.id || "",
            userID : userVendor?.user_id || user?.uid || "-",
            
            picName : userVendor?.pic_name || "-",
            phone : userVendor?.phone || "-", 
            companyRole : userVendor?.company_role || "-", 
            nikNumber : userVendor?.nik_number || "=", 
    
            name : userVendor?.name || "-", 
            description : userVendor?.description || "-", 
            address : userVendor?.address || "-", 
            city : userVendor?.city || "-", 
            serviceArea : userVendor?.service_area || [], 
            websiteUrl : userVendor?.website || "-", 
            instagram : userVendor?.instagram || "-", 
            banktName : userVendor?.bank_name || "-", 
            bankAccountName : userVendor?.bank_account || "-", 
            bankAccountNumber : userVendor?.bank_account_number || "-",
    
            category : userVendor?.category || "",
            supportedServices : userVendor?.supported_services || [],
            servicePricing : userVendor?.service_pricing || {},
    
            status : userVendor?.status || "-",
           
        }
        return dataField
    }

    //     user_id: uid,
    //     type: "profile",

    //     // phase 1
    //     pic_name: String(form.pic_name || "").trim(),
    //     phone: String(form.phone || "").trim(),
    //     company_role: String(form.company_role || "").trim(),
    //     nik_number: String(form.nik_number || "").trim(),

    //     // phase 2
    //     name: String(form.name || "").trim(),
    //     description: String(form.description || "").trim(),
    //     address: String(form.address || "").trim(),
    //     city: String(form.city || "").trim(),
    //     service_area: uniq(form.service_area),
    //     website: String(form.website || "").trim(),
    //     instagram: String(form.instagram || "").trim(),
    //     bank_name: String(form.bank_name || "").trim(),
    //     bank_account: String(form.bank_account || "").trim(),
    //     bank_account_number: String(form.bank_account_number || "").trim(),

    //     // phase 3
    //     category: String(form.category || "").trim(),
    //     supported_services: uniq(selectedServiceCodes),
    //     service_pricing,

    //     // auto
    //     status: "pending",
    //     tier: "Standard",
    //     createdAt: serverTimestamp(),
    //     updatedAt: serverTimestamp(),


    const [activeMenu, setActiveMenu] = useState("Product & Services");

    return (
        <div className=" w-full h-screen flex flex-row">
            {/* Side Menu */}
            <div className="border-r-2 border-gray-300 bg-white w-100 h-screen p-2">
                <div className="top flex flex-col items-center pt-10 pb-15">
                    {/* Photo */}
                    <div className="w-15 h-15 bg-gray-500 rounded-full">

                    </div>
                    <div className="flex flex-col items-center mt-2">
                        <h2 className="text-sm">Prophecy Wedding</h2>
                        {vendorsLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <h1 className="text-xl">{getDataField().name || "-"}</h1>
                        )}
                    </div>
                </div>

                {/* Menu Nav */}
                <div className="flex flex-col items-baseline gap-4 px-4 w-70">
                    <button
                    className={`p-3 pl-6 w-full  rounded-xl flex flex-row justify-start
                    hover:pl-8 transition-all duration-300 ease-in-out ${activeMenu === "Product & Services" && "bd-6 pl-8 bg-emerald-500 text-white"}`}
                    onClick={() => setActiveMenu("Product & Services")}
                    >Product & Services</button>
                    <button
                    className={`p-3 pl-6 w-full rounded-xl flex flex-row justify-start
                    hover:pl-8 transition-all duration-300 ease-in-out ${activeMenu === "Events" && "bd-6 pl-8 bg-emerald-500 text-white"}`}
                    onClick={() => setActiveMenu("Events")}
                    >Events</button>
                </div>
            </div>

            {/* Right Display */}
            <div className="flex flex-col w-full h-full p-4 bg-gray-100">
                {/* Head */}
                <div className="flex flex-row justify-between items-center px-4 py-2">
                    <h1 className="text-2xl">{activeMenu}</h1>
                    {profileLoading || loading || !user ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex flex-row gap-8 items-center">
                                <div className="flex flex-row gap-1">
                                    <p className="text-xs">{userDoc?.username + ","}</p>
                                    <p className="text-xs">{user?.email}</p>
                                </div>
                                <button>
                                <img className="w-5 h-5 rounded-full" src="/icons/icons8-notification-30.png" alt="" />
                                </button>
                                <button>
                                <img className="w-10 h-10 rounded-full" src="/icons/icons8-profile-30.png" alt="" />
                                </button>
                            </div>
                        </div>
                    )
                    }
                </div>

                {/* Content */}
                
                {vendorsLoading && <LoadingSkeleton />}
                {activeMenu === "Product & Services" && (
                    <ProductServices 
                    userVendor={getDataField()}
                    userVendorLoading={vendorsLoading}
                    userVendorError={vendorsError}
                    />
                )}

                {activeMenu === "Events" && (
                    <VendorEvent
                    userVendor={getDataField()}
                    userVendorLoading={vendorsLoading}
                    userVendorError={vendorsError}
                    />
                )}
            </div>

            <DevTools />
        </div>
    )
}