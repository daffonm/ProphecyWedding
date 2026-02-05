import LoadingSkeleton from "@/components/LoadingSkeleton"
import { useDb } from "@/context/DbContext"
import { useCollection } from "@/hooks/useCollection"
import { useDoc } from "@/hooks/useDoc"
import { useMemo, useState } from "react"

import Overlay from "@/components/Overlay"

function AssignmentBox({
   a, uv,

  dbFunc, handleSelect
    }) {

        const { colRef, where, query } = dbFunc
        const bId = a?.booking_id
        const ct = a?.created_at
        const ut = a?.updated_at

        
        const assignedReq = a?.assigned_vendors.filter(v => v.vendor_uid == uv.userId)
        const b = useDoc("Bookings", bId, { enabled:true })
        const {data, loading, error} = b

        const venueRef = data?.location_date_info?.venue

        const vendorQuery = useMemo(() => {
            return () => venueRef ? query(colRef("Vendors"), where("id", "==", venueRef)) : null;
        }, [venueRef, colRef, query]);
        const {
            rows: venues,
            loading: venuessLoading,
            error: venuesError,
        } = useCollection(vendorQuery, [venueRef], { enabled: Boolean(venueRef) });
        const [venue] = venues
        console.log(venueRef)
        console.log(venue)

    return (
        <div>
            {loading ? <LoadingSkeleton /> :
             <div className="bg-white bd-6 rounded-4xl p-4 w-100 border-t-10 border-emerald-500">
                <div className="flex flex-row">
                    <h1 className="section-title">{data?.customer_info?.groom_name + " & " + data?.customer_info?.bride_name}</h1>
                    <h1>'s Wedding</h1>
                </div>
                <div>
                    <h1>
                        {venue?.name}
                    </h1>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p>
                    {data.location_date_info?.date}
                    </p>
                    <button 
                    className="border rounded-4xl py-1 px-2 border-emerald-500 text-emerald-500"
                    onClick={() => handleSelect(a.id, {
                        assignment: a,
                        booking : b.data,
                        requirement : assignedReq,
                    })}
                    >View</button>
                </div>
             
 
                 {/* {assignedReq.map((r, index) => {
                     return (
                     <div key={index}>  
                         <p>{r.assignment_status}</p>
                         <p>{r.category}</p>
                     </div>
                     )
                 }
                 )} */}

             </div>
            }
        
        </div>
    )
}

function AssignmentInfo({dt, onClose}) {
    return (
        <div className="w-100 h-100 bg-white rounded-xl">
            <button 
            onClick={onClose}>
            X
            </button>
            <div>
                {console.log(dt)}
            </div>
        </div>
    )
}

export default function VendorEvent({
    userVendor,
    userVendorLoading,
    userVendorError
}) {

    const { colRef, where, query } = useDb()

    const assignmentQuery = useMemo(() => {
        return () => query(
            colRef("vendor_assignments"),
            where("assigned_vendor_keys", "array-contains", userVendor.vendorID)
            );
    }, [colRef, query, where]);

    const {
        rows: assigmentsRows,
        loading: assignmentsLoading,
        error: assignmentsError,
    } = useCollection(assignmentQuery, [], { enabled: true });
    
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [selectedData, setSelectedData] = useState({})
    const selectAssignment = (aId, dt) => {
        setSelectedAssignment(aId)
        setSelectedData(dt)
    }
    const unselectAssignment = () => {
        setSelectedAssignment(null)
        setSelectedData({})
    }

    const filterAssignments = (filter, rows) => {
        
    }
    

    return (
        <div className="p-4">

            <Overlay
            isOpen={selectedAssignment}
            onClose={unselectAssignment}
            contentClassName={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}
            ><AssignmentInfo dt={selectedData} onClose={unselectAssignment}/></Overlay>

            {/* assingment Bar */}
            <div>
               
                <div className="flex flex-row items-baseline justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-xl">Event Assigned for You </h1>
                    </div>
               
                </div>

                {/*  Container */}
                <div className="overflow-x-scroll no-scrollbar flex flex-row py-4 gap-8">
                    {assignmentsLoading? <LoadingSkeleton /> :
                        assigmentsRows.length ? 
                        assigmentsRows.map((a) => <AssignmentBox key={a.id} a={a} uv={userVendor} dbFunc={{where, colRef, query}} handleSelect={selectAssignment} /> )
                        : <p>Admin have not set Assignments for you</p>
                    }
                </div>

            </div>

        </div>
    )
}