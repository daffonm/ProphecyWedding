export const bookingStatuses = [
    {
        label : "Pending",
        value : "PENDING",
        color : "bg-yellow-500",
        textColor : "text-yellow-200",
        desc: "Draft has been submitted for review by the admin"
    },
    {
        label : "On Review",
        value : "REVIEWing",
        color : "bg-orange-500",
        textColor : "text-yellow-200",
        desc: "Admin is reviewing your Draft"
    },
    {
        label : "Revision",
        value : "REVISION",
        color : "bg-pink-500",
        textColor : "text-pink-200",
        desc: "Draft needs specific adjustments from the customer"
    },

    { // FINAL FIXING PRICES
        label : "Quotation",
        value : "QUOTATION",
        color : "bg-purple-500",
        textColor : "text-purple-200",
        desc: "Admin is finalizing the Prices and creating invoice"
    },

    {
        label : "Payment Due",
        value : "PAYMENT",
        color : "bg-green-500",
        textColor : "text-green-200",
        desc: "Waiting for customer's payment"
    },
    {
        label : "On Project",
        value : "PROJECT",
        color : "bg-blue-500",
        textColor : "text-blue-200",
        desc: "The project is running"
    },
    {
        label : "Completed",
        value : "COMPLETED",
        color : "bg-gray-500",
        textColor : "text-gray-200",
        desc: "Project is Completed"
    },
    {
        label : "Canceled",
        value : "CANCELED",
        color : "bg-red-500",
        textColor : "text-red-200",
        desc: "Project is Canceled"
    },
]

export const paymentStatuses = [
    {
        label : "Partially Paid",
        value : "PARTIALLY",
    },
    {
        label : "Paid",
        value : "PAID",
    },
    {
        label : "Unpaid",
        value : "UNPAID",
    },

]

export const getBStatus = (st) => bookingStatuses.map((s) => s.label === st && s.desc)

export const vendorStatuses  = [
        // { label: "All Vendors", code:"all_vendors", color: "bg-emerald-500", textColor: "text-white" },
        { label: "Idle", code:"idle",  color: "border border-emerald-500", textColor: "text-emerald-500" },
        { label: "Assigned", code:"assigned",  color: "border border-purple-500", textColor: "text-purple-500" },
        { label: "On Project", code:"project",  color: "border border-blue-500", textColor: "text-blue-500" },
        { label: "Pending Approval", code:"pending",  color: "border border-yellow-500", textColor: "text-yellow-500" },
        { label: "Unavailable", code:"unavailable",  color: "border border-red-500", textColor: "text-red-500" },
    ]
const assignmentStatuses = [
    { label: "Assigned", color: "bg-yellow-500", textColor: "text-white"},
    { label: "Approved", color: "bg-green-500", textColor: "text-white"},
    { label: "Rejected", color: "bg-red-500", textColor: "text-white"},
    { label: "On Project", color: "bg-blue-500", textColor: "text-white"},
]