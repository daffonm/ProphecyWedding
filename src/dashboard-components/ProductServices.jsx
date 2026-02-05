import { formatRupiah } from "@/utils/format"

function ServiceBubble({objectKey, v}) {
    return (
        <div 
        className={`bg-white bd-6 rounded-xl p-4 w-80 h-80 flex flex-col justify-between`}
        >
            {/* Content */}
            <div className="flex flex-col">
                <div className="flex flex-row justify-between">
                    <div className="rounded-full w-8 h-8 bg-amber-300">

                    </div>
                    <p>{objectKey}</p>
                </div>
                <div className="flex flex-col gap-4">

                    <div className="flex flex-col mt-8">
                        <p className="text-xs">Prefered Cost Per Unit (CPU) :</p>
                        <p>{formatRupiah(v.servicePricing[objectKey].cost_per_unit)}</p>
                    </div>
                    <div>
                        <p className="text-xs">Pricing Unit :</p>
                        <p>{v.servicePricing[objectKey].pricing_unit.replace("_", " ")}</p>
                    </div>
                    <div>
                        <p className="text-xs">Service Status :</p>
                        <p>{"Available"}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-4">
                <button
                className="border py-1 px-2 w-20"
                >Edit</button>
                <button
                className="border py-1 px-2 w-full"
                >Set Unavailable</button>
            </div>
        </div>
    )
}

export default function ProductServices({
    userVendor,
    userVendorLoading,
    userVendorError,
}) {
    return (
        <div className="p-4">
            <div>
               
                <div className="flex flex-row items-baseline justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="">Your service category : </h1>
                        <h1 className="text-xl">{userVendor.category || "-"}</h1>
                    </div>
                    <button
                    className="button1"
                    >Add Service</button>
                </div>

                {/* Services Container */}
                <div className="overflow-x-scroll no-scrollbar flex flex-row py-4 gap-8">
                    {Object.keys(userVendor.servicePricing).map((key) => (
                        // Service Bubble
                        <ServiceBubble key={key} objectKey={key} v={userVendor} />
                    ))}
                </div>
            </div>


        </div>
    )
}