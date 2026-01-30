export const bookingStatuses = [
    {
        label : "Pending",
        value : "PENDING",
        color : "bg-yellow-500",
        textColor : "text-yellow-200",
        desc: "Draft has been submitted for review by the admin. Please wait for approval"
    },
    {
        label : "On Review",
        value : "REVIEWing",
        color : "bg-orange-500",
        textColor : "text-yellow-200",
        desc: "Admin Reviewing Draft"
    },
    {
        label : "Revision",
        value : "REVISION",
        color : "bg-pink-500",
        textColor : "text-pink-200",
        desc: "Draft needs specific adjustments from customer"
    },

    { // FINAL FIXING PRICES
        label : "Quotation",
        value : "QUOTATION",
        color : "bg-purple-500",
        textColor : "text-purple-200",
        desc: "Admin is quotating draft"
    },

    {
        label : "Payment Due",
        value : "PAYMENT",
        color : "bg-green-500",
        textColor : "text-green-200",
        desc: "Admin is waiting for payment"
    },
    {
        label : "On Project",
        value : "PROJECT",
        color : "bg-blue-500",
        textColor : "text-blue-200",
        desc: "Project is Running"
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