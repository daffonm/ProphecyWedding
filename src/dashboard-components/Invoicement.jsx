"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useDb } from "@/context/DbContext";

const INVOICE_COL = "Invoices"; // ✅ per request (capital I)
const ASSIGNMENTS_COL = "vendor_assignments"; // TODO_DB_FIELDS if different

function pad2(n) {
  return String(Number(n || 0)).padStart(2, "0");
}

function num(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function normUnit(u) {
  return String(u || "").toLowerCase().trim();
}

function unitMultiplier(pricingUnit, guestCount, { perHour = 5, perDay = 1 } = {}) {
  const u = normUnit(pricingUnit);

  if (u.includes("pax") || u === "per_pax") return num(guestCount);
  if (u.includes("hour") || u === "per_hour") return num(perHour);
  if (u.includes("day") || u === "per_day") return num(perDay);
  if (u.includes("event") || u === "per_event") return 1;

  if (u.includes("quantity") || u === "per_quantity") return 1;

  return 1;
}

export default function Invoicement({ booking, venue, updateBstatus }) {
  const { query, where, colRef, orderBy, limit, getDocs, addDoc, updateDoc, serverTimestamp } = useDb();

  // Local state (no realtime listener -> hemat kuota)
  const [assignmentsRow, setAssignmentsRow] = useState(null);
  const [invoiceDoc, setInvoiceDoc] = useState(null); // {id, ...data}
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Add item UI state
  const [showAdd, setShowAdd] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const [addUnitPrice, setAddUnitPrice] = useState("");
  const [addQty, setAddQty] = useState(1);

  // Defaults
  const guestCount =
    booking?.location_date_info?.guest_count ?? booking?.location_date_info?.guestCount ?? 0; // TODO_DB_FIELDS
  const defaultPerHour = 5;
  const defaultPerDay = 1;

  const fetchAssignmentsOnce = useCallback(async () => {
    if (!booking?.id) return null;
    const q = query(colRef(ASSIGNMENTS_COL), where("booking_id", "==", booking.id)); // TODO_DB_FIELDS
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return rows[0] || null;
  }, [booking?.id, booking?.id, query, colRef, where, getDocs]);

  const fetchLatestInvoiceOnce = useCallback(async () => {
    if (!booking?.id) return null;

    const q = query(
      colRef(INVOICE_COL),
      where("booking_id", "==", booking.id), // TODO_DB_FIELDS
      orderBy("invoice_version", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return rows[0] || null;
  }, [booking?.id, booking?.id, query, colRef, where, orderBy, limit, getDocs]);

  // Initial fetch only (1x per booking id)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!booking?.id) return;
      setLoading(true);
      setErr(null);
      try {
        const [a, inv] = await Promise.all([fetchAssignmentsOnce(), fetchLatestInvoiceOnce()]);
        if (cancelled) return;
        setAssignmentsRow(a);
        setInvoiceDoc(inv); // can be null (created later on button click)
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [booking?.id, fetchAssignmentsOnce, fetchLatestInvoiceOnce]);

  // Accepted only (admin doesn't set accepted/rejected)
  const acceptedAssignments = useMemo(() => {
    const raw = Array.isArray(assignmentsRow?.assigned_vendors) ? assignmentsRow.assigned_vendors : []; // TODO_DB_FIELDS
    return raw.filter((x) => String(x?.assignment_status || "").toLowerCase() === "accepted");
  }, [assignmentsRow]);

  const vendorItems = useMemo(() => {
    return acceptedAssignments.map((a, idx) => {
      const serviceCode = String(a?.service_code || a?.serviceCode || ""); // TODO_DB_FIELDS
      const label = String(a?.service_label || a?.label || serviceCode); // TODO_DB_FIELDS
      const unitPrice = num(a?.cost_per_unit ?? a?.unit_price ?? a?.unitPrice); // TODO_DB_FIELDS
      const pricingUnit = String(a?.pricing_unit || a?.pricingUnit || "per_event"); // TODO_DB_FIELDS

      const unitCount = unitMultiplier(pricingUnit, guestCount, { perHour: defaultPerHour, perDay: defaultPerDay });

      return {
        code: serviceCode,
        label,
        unit_count: unitCount,
        unit_price: unitPrice,
        pricing_unit: pricingUnit,
        total_unit_price: unitPrice * unitCount,
        _source: "vendor",
        _k: `vendor::${serviceCode}::${idx}`,
      };
    });
  }, [acceptedAssignments, guestCount]);

  const venueItem = useMemo(() => {
    if (!venue) return null;

    // TODO_DB_FIELDS: adjust venue pricing fields if needed
    const label = String(venue?.name || venue?.label || "Venue");
    const unitPrice = num(venue?.price ?? venue?.unit_price ?? venue?.cost_per_unit ?? venue?.base_price);
    const pricingUnit = String(venue?.pricing_unit || "per_event");

    if (!unitPrice) return null;

    const unitCount = unitMultiplier(pricingUnit, guestCount, { perHour: defaultPerHour, perDay: defaultPerDay });

    return {
      code: String(venue?.code || venue?.id || "VENUE"),
      label,
      unit_count: unitCount,
      unit_price: unitPrice,
      pricing_unit: pricingUnit,
      total_unit_price: unitPrice * unitCount,
      _source: "venue",
      _k: `venue::${String(venue?.id || venue?.code || "VENUE")}`,
    };
  }, [venue, guestCount]);

  const addedOnQuote = useMemo(() => {
    return Array.isArray(invoiceDoc?.addedOnQuote) ? invoiceDoc.addedOnQuote : [];
  }, [invoiceDoc]);

  const addedItems = useMemo(() => {
    return addedOnQuote.map((it, idx) => {
      const label = String(it?.label || "");
      const unitPrice = num(it?.unit_price);
      const unitCount = Math.max(1, Math.floor(num(it?.unit_count || 1)));
      const pricingUnit = String(it?.pricing_unit || "per_quantity");

      return {
        code: String(it?.code || ""),
        label,
        unit_count: unitCount,
        unit_price: unitPrice,
        pricing_unit: pricingUnit,
        total_unit_price: unitPrice * unitCount,
        _source: "addon",
        _k: String(it?.id || `addon::${idx}`),
      };
    });
  }, [addedOnQuote]);

  const allItems = useMemo(() => {
    const items = [...vendorItems];
    if (venueItem) items.unshift(venueItem);
    items.push(...addedItems);
    return items;
  }, [vendorItems, venueItem, addedItems]);

  const totals = useMemo(() => {
    const totalPrice = allItems.reduce((sum, it) => sum + num(it.total_unit_price), 0);
    const totalItems = allItems.length;

    const totalDiscount = num(invoiceDoc?.total_discount);
    const totalTax = num(invoiceDoc?.total_tax);
    const finalPrice = totalPrice - totalDiscount + totalTax;

    return { totalPrice, totalItems, totalDiscount, totalTax, finalPrice };
  }, [allItems, invoiceDoc]);

  // Create invoice ONLY when user needs it (Add Item / New Version / Submit)
  const ensureInvoiceExists = useCallback(async () => {
    if (invoiceDoc?.id) return invoiceDoc;
    if (!booking?.id) return null;

    setSaving(true);
    setErr(null);
    try {
      // Check latest again once (cheap, but only on action)
      const latest = await fetchLatestInvoiceOnce();
      const version = latest ? num(latest.invoice_version || 0) + 1 : 1;

      const base = {
        booking_id: booking.id, // TODO_DB_FIELDS
        invoice_version: version,
        invoice_status: "draft",
        invoice_id: "",

        total_items: 0,
        items: [], // snapshot filled only on explicit actions
        addedOnQuote: [],
        total_addedOnQuote: 0,

        discounts: [],
        total_discount: 0,
        taxes: [],
        total_tax: 0,

        total_price: 0,
        final_price: 0,

        payment_system: booking?.payment_info?.payment_system || "", // TODO_DB_FIELDS
        payment_method: booking?.payment_info?.payment_method || "", // TODO_DB_FIELDS
        payment_status: "unpaid",

        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const ref = await addDoc(INVOICE_COL, base);
      const invoiceId = `${ref.id}${pad2(version)}`;
      await updateDoc(INVOICE_COL, ref.id, { invoice_id: invoiceId });

      const created = { id: ref.id, ...base, invoice_id: invoiceId };
      setInvoiceDoc(created);
      return created;
    } catch (e) {
      console.error(e);
      setErr(e);
      return null;
    } finally {
      setSaving(false);
    }
  }, [invoiceDoc, booking?.id, booking, addDoc, updateDoc, serverTimestamp, fetchLatestInvoiceOnce]);

  // Explicit persist snapshot (NOT per render)
  const persistSnapshot = useCallback(
    async (inv) => {
      if (!inv?.id) return;

      setSaving(true);
      setErr(null);
      try {
        const itemsPayload = allItems.map((it) => ({
          code: it.code,
          label: it.label,
          unit_count: it.unit_count,
          unit_price: it.unit_price,
          pricing_unit: it.pricing_unit,
          total_unit_price: it.total_unit_price,
          source: it._source,
        }));

        await updateDoc(INVOICE_COL, inv.id, {
          items: itemsPayload,
          total_items: totals.totalItems,
          total_price: totals.totalPrice,
          final_price: totals.finalPrice,
          updated_at: serverTimestamp(),
        });

        setInvoiceDoc((prev) =>
          prev?.id === inv.id
            ? {
                ...prev,
                items: itemsPayload,
                total_items: totals.totalItems,
                total_price: totals.totalPrice,
                final_price: totals.finalPrice,
              }
            : prev
        );
      } catch (e) {
        console.error(e);
        setErr(e);
      } finally {
        setSaving(false);
      }
    },
    [allItems, totals, updateDoc, serverTimestamp]
  );

  // Add item (writes only on click)
  const onAddItemConfirm = useCallback(async () => {
    const inv = await ensureInvoiceExists();
    if (!inv?.id) return;

    const label = String(addLabel || "").trim();
    const unitPrice = num(addUnitPrice);
    const qty = Math.max(1, Math.floor(num(addQty)));

    if (!label || unitPrice <= 0) return;

    const nextAdded = [
      ...(Array.isArray(inv.addedOnQuote) ? inv.addedOnQuote : []),
      { id: `${Date.now()}`, code: "", label, unit_count: qty, unit_price: unitPrice, pricing_unit: "per_quantity" },
    ];

    setSaving(true);
    setErr(null);
    try {
      await updateDoc(INVOICE_COL, inv.id, {
        addedOnQuote: nextAdded,
        total_addedOnQuote: nextAdded.length,
        updated_at: serverTimestamp(),
      });

      const nextInv = { ...inv, addedOnQuote: nextAdded, total_addedOnQuote: nextAdded.length };
      setInvoiceDoc(nextInv);

      await persistSnapshot(nextInv);

      setAddLabel("");
      setAddUnitPrice("");
      setAddQty(1);
      setShowAdd(false);
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setSaving(false);
    }
  }, [ensureInvoiceExists, addLabel, addUnitPrice, addQty, updateDoc, serverTimestamp, persistSnapshot]);

  const onRemoveAddedItem = useCallback(
    async (itemId) => {
      const inv = await ensureInvoiceExists();
      if (!inv?.id) return;

      const nextAdded = (Array.isArray(inv.addedOnQuote) ? inv.addedOnQuote : []).filter(
        (x) => String(x?.id) !== String(itemId)
      );

      setSaving(true);
      setErr(null);
      try {
        await updateDoc(INVOICE_COL, inv.id, {
          addedOnQuote: nextAdded,
          total_addedOnQuote: nextAdded.length,
          updated_at: serverTimestamp(),
        });

        const nextInv = { ...inv, addedOnQuote: nextAdded, total_addedOnQuote: nextAdded.length };
        setInvoiceDoc(nextInv);

        await persistSnapshot(nextInv);
      } catch (e) {
        console.error(e);
        setErr(e);
      } finally {
        setSaving(false);
      }
    },
    [ensureInvoiceExists, updateDoc, serverTimestamp, persistSnapshot]
  );

  const onCreateNewVersion = useCallback(async () => {
    if (!booking?.id) return;

    setSaving(true);
    setErr(null);
    try {
      const latest = await fetchLatestInvoiceOnce();
      const version = latest ? num(latest.invoice_version || 0) + 1 : 1;

      const base = {
        booking_id: booking.id, // TODO_DB_FIELDS
        invoice_version: version,
        invoice_status: "draft",
        invoice_id: "",

        total_items: 0,
        items: [],
        addedOnQuote: [],
        total_addedOnQuote: 0,

        discounts: [],
        total_discount: 0,
        taxes: [],
        total_tax: 0,

        total_price: 0,
        final_price: 0,

        payment_system: booking?.payment_info?.payment_system || "",
        payment_method: booking?.payment_info?.payment_method || "",
        payment_status: "unpaid",

        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const ref = await addDoc(INVOICE_COL, base);
      const invoiceId = `${ref.id}${pad2(version)}`;
      await updateDoc(INVOICE_COL, ref.id, { invoice_id: invoiceId });

      setInvoiceDoc({ id: ref.id, ...base, invoice_id: invoiceId });
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setSaving(false);
    }
  }, [booking?.id, booking, addDoc, updateDoc, serverTimestamp, fetchLatestInvoiceOnce]);

  const onSubmitToClient = useCallback(async () => {
    const inv = await ensureInvoiceExists();
    if (!inv?.id) return;

    setSaving(true);
    setErr(null);
    try {
      await persistSnapshot(inv);

      await updateDoc(INVOICE_COL, inv.id, {
        invoice_status: "submitted",
        updated_at: serverTimestamp(),
      });

      setInvoiceDoc((prev) => (prev?.id === inv.id ? { ...prev, invoice_status: "submitted" } : prev));
      updateBstatus()
      // TODO_DB_FIELDS: update booking status to payment_due if needed
      // await updateDoc("Bookings", booking.id, { bookingStatus: "payment_due" });
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setSaving(false);
    }
  }, [ensureInvoiceExists, persistSnapshot, updateDoc, serverTimestamp]);

  // Optional manual refresh (single read) if you want
  const onRefresh = useCallback(async () => {
    if (!booking?.id) return;
    setLoading(true);
    setErr(null);
    try {
      const [a, inv] = await Promise.all([fetchAssignmentsOnce(), fetchLatestInvoiceOnce()]);
      setAssignmentsRow(a);
      setInvoiceDoc(inv);
    } catch (e) {
      console.error(e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [booking?.id, fetchAssignmentsOnce, fetchLatestInvoiceOnce]);

  if (!booking?.id) return null;

  return (
    <div className="p-4 bg-white rounded-lg border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Invoice</div>
          <div className="text-xs text-gray-600 break-all">Invoice ID: {invoiceDoc?.invoice_id || "-"}</div>
          <div className="text-xs text-gray-600">Version: {pad2(invoiceDoc?.invoice_version || 0) || "00"}</div>
          <div className="text-xs text-gray-600">
            Billed to: {booking?.customer_info?.reservation_name || "-"} {/* TODO_DB_FIELDS */}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border rounded px-2 py-1 text-xs" onClick={onRefresh}>
            Refresh
          </button>
          <button className="border rounded px-2 py-1 text-xs" onClick={() => setShowAdd((v) => !v)}>
            Add Item
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mt-3 border rounded p-3">
          <div className="text-xs font-semibold mb-2">Add item to quote</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              className="border rounded px-2 py-1 text-xs md:col-span-2"
              placeholder="Label"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 text-xs"
              placeholder="Unit Price"
              value={addUnitPrice}
              onChange={(e) => setAddUnitPrice(e.target.value)}
              inputMode="numeric"
            />
            <input
              className="border rounded px-2 py-1 text-xs"
              placeholder="Qty"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="border rounded px-2 py-1 text-xs" onClick={onAddItemConfirm}>
              Confirm
            </button>
            <button className="border rounded px-2 py-1 text-xs" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs font-semibold mb-2">Items</div>

        <div className="flex flex-col gap-2">
          {allItems.map((it) => (
            <div key={it._k} className="flex items-center justify-between border rounded p-2">
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{it.label}</div>
                <div className="text-[11px] text-gray-600">
                  {it.unit_count} × {it.unit_price} ({it.pricing_unit})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold">{it.total_unit_price}</div>
                {it._source === "addon" && (
                  <button className="border rounded px-2 py-1 text-xs" onClick={() => onRemoveAddedItem(it._k)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {!allItems.length && <div className="text-xs text-gray-600">No items yet.</div>}
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="flex justify-between text-xs">
          <span>Total items</span>
          <span>{totals.totalItems}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Total price</span>
          <span>{totals.totalPrice}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Discount</span>
          <span>{totals.totalDiscount}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Tax</span>
          <span>{totals.totalTax}</span>
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span>Final price</span>
          <span>{totals.finalPrice}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="border rounded px-2 py-1 text-xs" onClick={onCreateNewVersion}>
          Create New Version
        </button>

        {String(invoiceDoc?.invoice_status || "draft") !== "submitted" && (
          <button className="border rounded px-2 py-1 text-xs" onClick={onSubmitToClient}>
            Submit to Client
          </button>
        )}
      </div>

      {(loading || saving) && <div className="mt-2 text-xs text-gray-600">Working...</div>}
      {err && <div className="mt-2 text-xs text-red-600">{String(err?.message || err)}</div>}
    </div>
  );
}
