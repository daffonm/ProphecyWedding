"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useDoc } from "@/hooks/useDoc"
import InvoiceTemplate from "@/components/InvoiceTemplate"

function formatDateLabel(iso) {
  // iso: "2026-02-11" -> "11 Feb, 2026" (optional)
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function normalizeMoney(n) {
  const x = Number(n ?? 0)
  return Number.isFinite(x) ? x : 0
}

export default function Page() {
  const { invoiceId } = useParams()

  const { data: inv, loading: invLoading, error: invError } = useDoc(
    "Invoices",
    invoiceId,
    { enabled: Boolean(invoiceId) }
  )

  const bookingId = inv?.booking_id

  const { data: book, loading: bookLoading, error: bookError } = useDoc(
    "Bookings",
    bookingId,
    { enabled: Boolean(bookingId) }
  )

  const loading = invLoading || bookLoading
  const err = invError || bookError

  const invoiceData = useMemo(() => {
    if (!inv || !book) return null

    const customer = book?.customer_info || {}
    const pay = book?.payment_info || {}
    const loc = book?.location_date_info || {}

    const items = Array.isArray(inv?.items) ? inv.items : []

    // Map invoice items -> template rows
    const rows = items.map((it, idx) => ({
      no: idx + 1,
      name: it?.label || it?.code || "",
      price: normalizeMoney(it?.unit_price),
      qty: Number(it?.unit_count ?? 0),
      total: normalizeMoney(it?.total_unit_price),
      meta: {
        pricing_unit: it?.pricing_unit || "",
        source: it?.source || "",
        code: it?.code || "",
      },
    }))

    return {
      // Header
      brandName: "Prophecy Wedding",
      invoiceTitle: "INVOICE",
      invoiceNo: inv?.invoice_id || String(invoiceId || ""),
      bookingNo: inv?.booking_id || String(inv?.booking_id || ""),

      // Bill To
      billTo: {
        name: customer?.reservation_name || "",
        city: customer?.city || "",
        phone: customer?.primary_contact_number || "",
        address: customer?.address || "",
        groom: customer?.groom_name || "",
        bride: customer?.bride_name || "",
      },

      // Items
      items: rows,

      // Totals (ambil dari invoice doc)
      totals: {
        total_items: normalizeMoney(inv?.total_price),
        discount: normalizeMoney(inv?.total_discount),
        tax: normalizeMoney(inv?.total_tax),
        final: normalizeMoney(inv?.final_price),
      },

      // Payment
      paymentDetails: {
        method: inv?.payment_method || pay?.payment_method || "Bank Transfer",
        system: inv?.payment_system || pay?.payment_system || "",
        paymentStatus: inv?.payment_status || "",
        // optional: ambil tanggal event (karena invoice tidak punya date)
        eventDate: loc?.date ? formatDateLabel(loc.date) : "",
      },

      bank: {
        bankName: pay?.account || "",
        accountName: pay?.account_name || "",
        accountNumber: pay?.account_number || "",
      },

      footerNote:
        "THANK YOU FOR LETTING PROPECHY WEDDING INC. BE PART OF YOUR SPECIAL MOMENT",
      signerTitle: "Manager",
    }
  }, [inv, book, invoiceId])

  if (loading) return <div className="p-6">Loading invoice...</div>
  if (err) return <div className="p-6 text-red-600">Error: {String(err?.message || err)}</div>
  if (!invoiceData) return <div className="p-6">Invoice not found</div>

  return <InvoiceTemplate data={invoiceData} />
}
