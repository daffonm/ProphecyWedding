import LoadingSkeleton from "@/components/LoadingSkeleton"
import { useDb } from "@/context/DbContext"
import { useCollection } from "@/hooks/useCollection"
import { useDoc } from "@/hooks/useDoc"
import { useMemo } from "react"

function AssignmentBox({
   a, uv,

  
    }) {

        const bId = a?.booking_id
        const ct = a?.created_at
        const ut = a?.updated_at

        
        const assignedReq = a?.assigned_vendors.filter(v => v.vendor_uid == uv.userId)
        const b = useDoc("Bookings", bId, { enabled:true })
        const {data, loading, error} = b

    return (
        <div>
            {loading ? <LoadingSkeleton /> :
             <div>
                 <p>{bId}</p>
                 <p>{data?.customer_info?.bride_name}</p>
                 <p>{data?.customer_info?.groom_name}</p>
             
 
                 {assignedReq.map((r, index) => {
                     return (
                     <div key={index}>
                         <p>{r.assignment_status}</p>
                         <p>{r.category}</p>
                     </div>
                     )
                 }
                 )}

             </div>
            }
        
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
    

    return (
        <div className="p-4">
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
                        assigmentsRows.map((a) => <AssignmentBox key={a.id} a={a} uv={userVendor} /> )
                        : <p>Admin have not set Assignments for you</p>
                    }
                </div>

            </div>
        </div>
    )
}