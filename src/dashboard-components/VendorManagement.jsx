import { useMemo, useState } from "react";

import { vendorStatuses } from "@/utils/status";

import LoadingSkeleton from "@/components/LoadingSkeleton";
import LoadingCircle from "@/components/AssignmentStatus";
import StatusPill from "@/components/StatusPill";

import Overlay from "@/components/Overlay";

export default function VendorManagement({}) {
    return (
        <div>
            <h1>Vendor Management</h1>
        </div>
    )

}


function VendorProfile ({ v , onClose, action}) {

    const [menuSelect, setMenuSelect] = useState("profile");


    return (
        <div className="bg-gray-300 bd-2 rounded-xl h-150 w-120 overflow-clip">
            <button onClick={onClose} className="ml-4 mt-4">X</button>
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-20 h-20 rounded-full bg-gray-500">
                        {/* Img */}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="bold">{v?.name}</p>
                        <p className="text-xs">{v?.category}</p>
                    </div>
                    <div>
                        <p className="text-xs">{v?.company_desription || "-"}</p>
                    </div>

                </div>

                <div className="flex flex-col h-full w-full bg-white rounded-t-xl">
                    <div className="bg-gray-200 flex flex-row justify-evenly rounded-t-lg pt-1">
                        <button 
                        className={`text-sm p-1 w-full rounded-t-xl ${menuSelect === "profile" && "bg-white bd-2"}`} 
                        onClick={() => setMenuSelect("profile")}>Profile</button>
                        <button 
                        className={`text-sm p-1 w-full rounded-t-xl ${menuSelect === "media" && "bg-white"}`} 
                        onClick={() => setMenuSelect("media")}>Media</button>
                        <button 
                        className={`text-sm p-1 w-full rounded-t-xl ${menuSelect === "projects" && "bg-white"}`}
                        onClick={() => setMenuSelect("projects")}
                        >Projects</button>
                    </div>
                    <div className="flex flex-col w-full h-full">

                        {menuSelect === "profile" &&
                        <div>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col gap-8 p-6">
                                    <div>
                                        <p className="text-xs">PIC Name</p>
                                        <p className="text-sm">{v?.pic_name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs">Phone</p>
                                        <p className="text-sm">{v?.phone || "-"}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs">Vendor Status</p>
                                        <StatusPill statusLabel={v?.status || "-"} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-baseline gap-4 pt-6 pr-8">
                                    <div className="flex flex-col items-center p-2 gap-2">
                                        <p className="text-xs">Services Area</p>
                                        <div className="flex flex-row gap-2 overflow-x-scroll">
                                            {v?.service_area?.map((s, id) => (
                                                <p key={id} className="text-xs border rounded-4xl px-2">{s}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs">Provided Services</p>
                                        {v?.supported_services.map((s, id) => (
                                            <p key={id} className="text-xs pl-2">{s}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                {v?.status === "pending" ?
                                <div className="bg-amber-200 p-4 flex flex-row justify-center items-center gap-8">
                                    <button>Reject</button>
                                    <button
                                    onClick={() => {
                                        action.approvePending(v.user_id, v.id)
                                        onClose()
                                    }
                                    }>Accept</button>
                                </div> 
                                :
                                <div className="bg-amber-200 p-4 flex flex-row justify-center items-center gap-8">
                                    <button>Contact</button>
                                    <button>Edit</button>
                                </div>
                                }
                            </div>

                        </div>
                        }

                        {menuSelect === "media" &&
                            <div className="p-4">
                                <p className="text-xs">This user has not uploaded any Images/Files</p>
                            </div>
                        }


                    </div>

                <div>

                    </div>
                </div>

            </div>

        </div>
    )
}

export function VendorRegistrationList({
    vendors,
    unregisteredVendor,
    vendorsLoading,
    vendorsError,

    patch,
}) {



    const [activeStatus, setActiveStatus] = useState("all_vendors");
    const [selectedVendor, setSelectedVendor] = useState(null);

    const approvePending = (uid, vendorId) => {
        patch("Users", uid, {
            role: "vendor",
            vendor_status: "registered",
        });

        patch("Vendors", vendorId, {
            status: "idle",
        });
    }

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


            <Overlay
                isOpen={selectedVendor}
                onClose={() => setSelectedVendor(null)}
                contentClassName="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                "
                >
                <VendorProfile 
                v={vendors.find((v) => v.id === selectedVendor)}
                action={{approvePending}}
                onClose={() => setSelectedVendor(null)}
                />
                </Overlay>
           
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
                return <VendorList key={v.id} v={v} handleSelect={setSelectedVendor}/>
            } )}
    
          </div>
            </div>
    
        </div>
      );

}
