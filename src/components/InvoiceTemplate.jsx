function formatIDR(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0)
}

function toText(v) {
  const s = String(v ?? "").trim()
  return s ? s : "-"
}

function toMoney(v) {
  if (v === null || v === undefined || v === "") return "-"
  const num = Number(v)
  if (!Number.isFinite(num)) return "-"
  return formatIDR(num)
}

function toQty(v) {
  if (v === null || v === undefined || v === "") return "-"
  const num = Number(v)
  if (!Number.isFinite(num)) return "-"
  return num
}

function normalizeStatus(raw) {
  const s = String(raw ?? "").trim().toLowerCase()
  if (!s) return "unpaid"
  if (s === "paid") return "paid"
  if (s === "unpaid") return "unpaid"
  if (s === "half paid" || s === "half_paid" || s === "partial" || s === "partially_paid") return "half paid"
  return s
}

function statusBadgeClass(status) {
  // keep subtle, no layout change
  if (status === "paid") return "bg-emerald-100 text-emerald-800 border-emerald-200"
  if (status === "half paid") return "bg-amber-100 text-amber-800 border-amber-200"
  return "bg-rose-100 text-rose-800 border-rose-200"
}

export default function InvoiceTemplate({ invoice, data }) {
  // Support both prop names (biar tidak pecah kalau ada yang masih pakai invoice=)
  const inv = data || invoice || {}

  // Items mapping: support either old shape (price/qty) or invoice-doc shape (unit_price/unit_count/total_unit_price)
  const computedItems = (inv.items || []).map((it, idx) => {
    const price =
      it?.price ?? it?.unit_price ?? 0

    const qty =
      it?.qty ?? it?.unit_count ?? 0

    const total =
      it?.total ?? it?.total_unit_price ?? ((Number(price) || 0) * (Number(qty) || 0))

    return {
      ...it,
      no: it?.no ?? (idx + 1),
      name: it?.name ?? it?.label ?? it?.code ?? "",
      price: Number(price) || 0,
      qty: Number(qty) || 0,
      total: Number(total) || 0,
    }
  })

  // Totals: prefer inv.totals.* then inv.final_price fields, else compute from items
  const computedSubTotal = computedItems.reduce((acc, it) => acc + (it.total || 0), 0)

  const subTotal =
    Number(inv?.totals?.total_items ?? inv?.total_price) ||
    computedSubTotal

  const discount =
    Number(inv?.totals?.discount ?? inv?.total_discount) || 0

  const tax =
    Number(inv?.totals?.tax ?? inv?.total_tax) || 0

  const totalDue =
    Number(inv?.totals?.final ?? inv?.final_price) ||
    (subTotal - discount + tax)

  const paymentStatus = normalizeStatus(inv?.paymentDetails?.paymentStatus ?? inv?.payment_status)

  return (
    <div className="w-full bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-225 overflow-hidden rounded-2xl bg-white shadow print:rounded-none print:shadow-none">
        {/* Decorative header band */}
        <div className="relative">
          <div className="h-24 w-full bg-linear-to-r from-indigo-950 via-indigo-800 to-indigo-950" />
          <div className="pointer-events-none absolute -top-10 right-0 h-32 w-72 rotate-6 bg-indigo-700/40" />
          <div className="pointer-events-none absolute -top-14 right-10 h-40 w-72 -rotate-6 bg-indigo-500/20" />

          <div className="absolute left-0 top-0 flex h-24 w-full items-center justify-between px-8">
            <div className="flex items-center gap-4">
              {/* Logo placeholder. Replace with Image if you have logo */}
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 text-white">
                PW
              </div>
              <div className="text-white">
                <div className="text-lg font-semibold leading-none">
                  {toText(inv.brandName)}
                </div>
                <div className="text-xs opacity-80">Wedding Services</div>
              </div>
            </div>

            <div className="text-right text-white">
              <div className="text-3xl font-extrabold tracking-wide">
                {toText(inv.invoiceTitle)}
              </div>

              {/* NEW: status badge */}
              <div className="mt-2 flex justify-end">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                    statusBadgeClass(paymentStatus),
                  ].join(" ")}
                >
                  {paymentStatus === "half paid" ? "HALF PAID" : String(paymentStatus).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Bill to and invoice no */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-800">
                BILL TO :
              </div>
              <div className="text-sm text-slate-800">
                <span className="font-semibold">{toText(inv.billTo?.name)}</span>
              </div>
              <div className="text-sm text-slate-600">{toText(inv.billTo?.address + ", " + inv.billTo?.city)}</div>
              <div className="text-sm text-slate-600">{toText(inv.billTo?.phone)}</div>
            </div>

            <div className="space-y-1 text-left md:text-right">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">INVOICE ID :</span>{" "}
                <span className="font-semibold">{toText(inv.invoiceNo)}</span>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">BOOKING ID :</span>{" "}
                <span className="font-semibold">{toText(inv.bookingNo)}</span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-12 bg-indigo-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
              <div className="col-span-1">No</div>
              <div className="col-span-5">Items</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-slate-200">
              {computedItems.map((it) => (
                <div
                  key={it.no}
                  className="grid grid-cols-12 px-4 py-3 text-sm text-slate-700"
                >
                  <div className="col-span-1 font-semibold">{it.no}</div>
                  <div className="col-span-5 font-semibold text-slate-800">
                    {toText(it.name)}
                  </div>
                  <div className="col-span-2 text-right">
                    {toMoney(it.price)}
                  </div>
                  <div className="col-span-2 text-right">{toQty(it.qty)}</div>
                  <div className="col-span-2 text-right font-semibold">
                    {toMoney(it.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <div className="text-sm font-semibold text-slate-700">
                  SUB TOTAL
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {toMoney(subTotal)}
                </div>
              </div>

              {/* Optional: show discount/tax rows only if non-zero, without changing layout too much */}
              {(discount !== 0 || tax !== 0) ? (
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">DISCOUNT</div>
                    <div className="text-sm font-bold text-slate-900">
                      {discount ? `-${toMoney(discount)}` : toMoney(0)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">TAX</div>
                    <div className="text-sm font-bold text-slate-900">
                      {toMoney(tax)}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-lg bg-indigo-900 px-4 py-3">
                <div className="text-sm font-semibold text-white">Total Due</div>
                <div className="text-sm font-extrabold text-white">
                  {toMoney(totalDue)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment details and signature */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="mb-4 inline-block rounded-md border border-slate-900 px-4 py-2 text-sm font-bold text-slate-900">
                PAYMENT DETAILS
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-semibold text-slate-700">
                    PAYMENT METHOD :
                  </div>
                  <div className="font-semibold text-slate-900">
                    {toText(inv.paymentDetails?.method)}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-semibold text-slate-700">
                    PAYMENT SYSTEM :
                  </div>
                  <div className="font-semibold text-slate-900">
                    {toText(inv.paymentDetails?.system)}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-semibold text-slate-700">
                    PAYMENT DATE :
                  </div>
                  <div className="font-semibold text-slate-900">
                    {toText(inv.paymentDetails?.paymentDate)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-700">
                    PAYMENT DUE DATE :
                  </div>
                  {/* user request: kalau ga ada, "-" aja */}
                  <div className="font-semibold text-slate-900">
                    {toText(inv.paymentDetails?.dueDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl border border-slate-200 p-5">
              <div className="text-sm font-bold text-slate-800">
                PAYMENT METHOD
              </div>

              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex gap-2">
                  <div className="w-32 text-slate-500">Bank</div>
                  <div className="font-semibold">
                    : {toText(inv.bank?.bankName)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-32 text-slate-500">Account Name</div>
                  <div className="font-semibold">
                    : {toText(inv.bank?.accountName)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-32 text-slate-500">Account Number</div>
                  <div className="font-semibold">
                    : {toText(inv.bank?.accountNumber)}
                  </div>
                </div>
              </div>

              {/* Signature placeholder */}
              <div className="mt-8 flex items-end justify-between">
                <div className="text-xs text-slate-500" />
                <div className="text-right">
                  <div className="h-10 w-40 rounded-md border border-dashed border-slate-300" />
                  <div className="mt-2 text-sm font-semibold text-slate-800">
                    {toText(inv.signerTitle)}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-right text-sm text-indigo-900">
                <div className="font-semibold">{toText(inv.contact?.city)}</div>
                <div className="font-semibold">{toText(inv.contact?.phone)}</div>
                <div className="font-semibold">{toText(inv.contact?.email)}</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-sm font-semibold tracking-wide text-indigo-900">
            {toText(inv.footerNote)}
          </div>
        </div>

        {/* Decorative footer band */}
        <div className="relative">
          <div className="h-10 w-full bg-linear-to-r from-indigo-950 via-indigo-800 to-indigo-950" />
          <div className="pointer-events-none absolute -bottom-12 left-0 h-24 w-72 -rotate-6 bg-indigo-700/40" />
        </div>
      </div>
    </div>
  )
}
