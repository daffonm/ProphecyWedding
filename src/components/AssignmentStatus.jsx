export default function AssignmentStatus({st,w,h, textClass}) {

    switch(st) {
        case "requested":
            return (
                <div className="flex flex-row gap-1">
                    <p className={textClass}>Requested</p>
                    <img className={`${w} ${h} rotate-center`} src="/icons/icons8-loading-yellow.png" alt="" />
                </div>
            );
        case "accepted":
            return (
                <div className="flex flex-row gap-1">
                    <p className={textClass + " text-emerald-500"}>Accepted</p>
                    <img className={`${w} ${h} rotate-center`} src="/icons/icons8-loading-yellow.png" alt="" />
                </div>
            );
        case "rejected":
            return (
                <div className="flex flex-row gap-1">
                    <p className={textClass + " text-red-500"}>Rejected</p>
                    <img className={`${w} ${h} rotate-center`} src="/icons/icons8-loading-yellow.png" alt="" />
                </div>
            );
        default:
            return null
    }

 
}