import { formatRupiah } from "@/utils/format"

function Badge({ label }) {
    return (
        <div className="border text-xs text-gray-500 border-gray-500 py-1 px-2 rounded-xl w-fit">
            {label}
        </div>
    )
}

function VenueItemBox({ v }) {
    return (
        <div
            className={`rounded-xl overflow-hidden bd-2 flex flex-col justify-between w-70 h-90 relative`}
        >
            {/* ImageBox placeholder */}
            <div className="bg-gray-200 h-62 w-full" />
    
            <div className="p-4 space-y-3">

            <div className="absolute bg-white flex flex-col justify-evenly top-62 right-0 w-full p-4 hover:top-14 transition-all h-full duration-300 ease-in-out">
                {/* Desc */}
                <div className="space-y-1">
                    <h2 className="font-semibold">{v?.name}</h2>
                    <p className="text-xs text-gray-600 line-clamp-2">{v?.address}</p>
                </div>
                <div className="">
                    <h2 className="font-semibold ">Allowed Services</h2>
                    {v?.allowed_services?.map((s, id) => (
                        <Badge key={id} label={s} />
                    ))}
                </div>
        
                <div className="flex items-end justify-between">
                    <div>
                    <p className="text-[11px] text-gray-500">Base Price</p>
                    <div className="font-semibold">{formatRupiah(v?.base_price)}</div>
                    </div>
        
                    <div className="text-right">
                    <p className="text-[11px] text-gray-500">Capacity</p>
                    <div className="text-sm font-semibold">{v?.capacity}</div>
                    </div>
                </div>
                <button>Edit</button>
        
                </div>

            </div>
        </div>
    )
}

export default function RegisteredVenues({
    venues,
    venuesLoading,
    venuesError,
}) {
    return (
        <div className="p-4 flex flex-col gap-4 w-full">
            <div>
                <button className="button2 rounded-xl text-sm">Add New</button>
            </div>
            {/* Container */}
            <div className="glassmorphism-pop  p-4 w-full h-120 overflow-y-scroll rounded-xl">
                {venuesError && <p className="text-red-500">{venuesError}</p>}
                {venuesLoading ? 
                    <LoadingSkeleton /> : 
                    venues.map((v) => (
                        <VenueItemBox key={v.id} v={v} />
                    ))
                    }
            </div>
        </div>
    )
}