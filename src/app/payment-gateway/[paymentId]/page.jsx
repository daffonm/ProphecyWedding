"use client"

import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
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
  console.log(invoiceId)


  const [paid, setPaid] = useState(false)

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

  console.log(inv)

  if (loading) return <div className="p-6">Loading invoice...</div>
  if (err) return <div className="p-6 text-red-600">Error: {String(err?.message || err)}</div>


  return (
        <div className="p-8 mx-auto">

            
            <h1 className="text-4xl">PAYMENT API</h1>
            <p>{`Amount : ${inv?.final_price}`}</p>

            {!paid && <button onClick={() => setPaid(true)}  className="button1">Pay</button>}
            {paid && <button className="">Payment Success!</button>}
            
        </div>

  )
}
