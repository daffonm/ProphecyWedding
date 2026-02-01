import { useMemo, useState } from "react";

import { vendorStatuses } from "@/utils/status";

import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusPill from "@/components/StatusPill";

export default function VendorManagement({}) {
    return (
        <div>
            <h1>Vendor Management</h1>
        </div>
    )

}


export function VendorRegistrationList({
    vendors,
    unregisteredVendor,
    vendorsLoading,
    vendorsError,
}) {



    const [activeStatus, setActiveStatus] = useState("all_vendors");
    const [selectedVendor, setSelectedVendor] = useState(null);


    const filteredVendors = useMemo(() => {
        console.log("vendors", vendors);
        console.log("activeStatus", activeStatus);
       
        if (activeStatus === "all_vendors") return vendors;
        return vendors.filter(
          (v) => (v.status || "") === activeStatus
        );
      }, [vendors, activeStatus]);


    function VendorList ({ v , handleSelect, }) {
    
        const name = v?.name || "-";
  
     
    
        return (
            <button className="flex flex-row items-center gap-6 px-2 py-4 rounded-xl bd-2 w-full h-12 overflow-hidden" 
            onClick={() => handleSelect(v.id)}>
                <div className="flex flex-col items-baseline justify-start w-20 overflow-clip">
                    Vendor Icon
                </div>
                <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
                    <p className="text-xs">Vendor Id</p>
                    <p className="text-sm">{v.id}</p>
                </div>
                <div className="flex flex-col items-baseline justify-start w-44 overflow-clip">
                    <p className="text-xs">Name</p>
                    <p className="text-sm">{name}</p>
                </div>
                <div className="flex flex-col items-baseline justify-start w-34 overflow-clip">
                    <p className="text-xs">Category</p>
                    <p className="text-sm">{v?.category || "-"}</p>
                </div>
                <div className="flex flex-col items-center justify-center w-20 h-full">
                    <StatusPill statusLabel={v.status} />
                </div>
                {/* <div>
                    <Image src="icons/icons8-right.svg" width={10} height={10} alt="arrow-right" />
                </div> */}
            </button>
        )
    }

    return (
        <div className="mt-6 flex flex-row justify-between h-full px-4">
           
          <div className="w-full h-120">
          {/* FILTERs */}
          <div className="flex flex-row w-full justify-between">
            {/* Status Filter */}
            <div className="flex flex-wrap mb-4 glassmorphism-pop shadow-dark w-fit rounded-xl p-1">
                <button 
                className={`px-4 py-2 rounded-xl text-xs ${activeStatus == "all_vendors" ? "bg-emerald-500 text-white" : ""}`} 
                onClick={() => setActiveStatus("all_vendors")}>All Vendors</button>
                {vendorStatuses.map((s, id) => (
                <button
                    key={id}
                    className={`px-4 py-2 rounded-xl text-xs ${
                    activeStatus === s.code ? "bg-emerald-500 text-white" : ""
                    }`}
                    onClick={() => setActiveStatus(s.code)}
                >
                    {s.label}
                </button>
                ))}
            </div>
          </div>
    
          {/* List Container*/}
          <div className="w-full overflow-x-auto flex flex-col gap-4 overflow-y-scroll px-2 py-2 glassmorphism shadow-dark rounded-xl h-full">
          
            {vendorsLoading && (
              <LoadingSkeleton />
            )}
    
            {!vendorsLoading && vendorsError && (
              <div className="text-sm text-red-300">
                Gagal memuat data: {String(error?.message || error)}
              </div>
            )}
    
            {!vendorsLoading&& !vendorsError && filteredVendors.length === 0 && (
              <div className="text-sm opacity-80">
                Tidak ada vendor dengan status: {activeStatus}
              </div>
            )}
    
            {/* {!selectedVendor?
              !loading && !vendorsError && filteredVendors.length > 0 && (
                  filteredVendors.map((b) => (
                      <ListItem key={b.id} b={b} handleSelect={onListSelected} selected={selectedBooking === b.id} />
                  ))
            ) : <BookingInformation 
              b={findBookingById(selectedBooking)} 
              u={usersById[findBookingById(selectedBooking)?.customer_id]}
              onClose= {() => setSelectedBooking(null)}
              action= {{update, updateVendorstatus}}
              />}


              
     */}

        

            {filteredVendors.map((v) => {
                return <VendorList key={v.id} v={v} />
            } )}
    
          </div>
            </div>
    
        </div>
      );

}
