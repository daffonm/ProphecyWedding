"use client";

import { useEffect, useMemo, useState } from "react";
import { useDb } from "@/context/DbContext";
import { useDoc } from "@/hooks/useDoc";
import { useVendorsByServiceCodes } from "@/hooks/useDocsByFields";

// util kecil: bikin deps stabil untuk array string
function stableKey(arr) {
  return (arr || []).filter(Boolean).join("|");
}

// helper: ubah doc assigned_vendors -> assignment object
function assignmentFromDraft(draft) {
  const out = {};
  const list = draft?.assigned_vendors;
  if (!Array.isArray(list)) return out;

  list.forEach((row) => {
    if (row?.service_code && row?.vendor_key) {
      out[String(row.service_code)] = String(row.vendor_key);
    }
  });

  return out;
}

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}


function ServicePill({ label, required }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-1 rounded-md text-xs border mr-2 mb-2",
        required ? "font-semibold border-black bg-white" : "text-gray-600 border-gray-300",
      ].join(" ")}
      title={required ? "Required for this event" : "Vendor supported service"}
    >
      {label}
    </span>
  );
}

/** Buat label lebih manusiawi bila ada di serviceMap */
function buildServiceLabel(code, serviceMap) {
  const s = serviceMap?.get?.(code);
  return s?.label ? `${s.label} (${code})` : code;
}

/**
 * Props:
 * - candidates: vendor kandidat untuk service tertentu
 * - requiredServiceCodes: semua kode service yang dibutuhkan event
 * - serviceMap: Map(code -> service detail) untuk label
 * - selectedVendorKey: vendorKey yang sedang dipilih untuk service ini
 * - onPick(vendorKey)
 * - onUnpick()
 * - serviceCode: kode service yang sedang di-assign
 */
function VendorCandidatesCollapsible({
  candidates = [],
  requiredServiceCodes = [],
  serviceMap,
  selectedVendorKey = "",
  onPick,
  onUnpick,
  serviceCode = "",
}) {
  if (!candidates.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-gray-600">
        Klik vendor untuk melihat layanan yang didukung.
        <span className="font-semibold"> Tebal</span> = layanan yang dibutuhkan acara.
      </div>

      {candidates.map((v, idx) => {
        const vendorKey = String(v.uid ?? v.id ?? `${serviceCode}-${idx}`);
        const isSelected = String(selectedVendorKey || "") === vendorKey;
        const vendorServices = Array.isArray(v.supported_services) ? v.supported_services : [];

        return (
          <details
            key={vendorKey}
            className={["rounded-lg border p-3", isSelected ? "border-black" : "border-gray-300"].join(" ")}
          >
            <summary className="cursor-pointer select-none flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{String(v.name ?? "-")}</span>
                <span className="text-xs text-gray-600">
                  {String(v.tier ?? "-")} • Rp{Number(v.cost_per_unit || 0).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isSelected ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // biar tidak toggle details saat klik tombol
                      onUnpick?.();
                    }}
                    className="text-xs px-3 py-1 rounded-md border border-gray-700 text-gray-800"
                    title="Batalkan pilihan"
                  >
                    Batalkan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onPick?.(vendorKey);
                    }}
                    className="text-xs px-3 py-1 rounded-md border border-black font-semibold"
                    title="Pilih vendor ini"
                  >
                    Pilih
                  </button>
                )}
              </div>
            </summary>

            <div className="mt-3 flex flex-wrap">
              {vendorServices.length === 0 ? (
                <span className="text-xs text-gray-500">Vendor belum mengisi supported services.</span>
              ) : (
                vendorServices.map((svcCode) => {
                  const required = (requiredServiceCodes || []).includes(svcCode);
                  return (
                    <ServicePill
                      key={`${vendorKey}-${svcCode}`}
                      label={buildServiceLabel(svcCode, serviceMap)}
                      required={required}
                    />
                  );
                })
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default function VendorAssignment({
  bookingId,
  requiredServiceCodes = [], // array string service codes event
  requiredServices = [],     // array object services (code/label/category)
  eventCity = null,          // opsional, kalau kosong -> unrestricted
  onClose,
}) {
  const { setDoc, serverTimestamp } = useDb();

  /**
   * 1) Load draft assignment dari Firestore (realtime)
   * useDoc kamu sudah handle listenDoc internally. :contentReference[oaicite:3]{index=3}
   */
  const {
    data: draft,
    loading: draftLoading,
    error: draftError,
  } = useDoc("vendor_assignments", String(bookingId), { enabled: Boolean(bookingId) });

  /**
   * 2) Kandidat vendor berdasarkan service codes event
   */
  const {
    vendors,
    loading: vendorsLoading,
    error: vendorsError,
  } = useVendorsByServiceCodes(requiredServiceCodes, {
    enabled: Boolean(requiredServiceCodes?.length),
  });

  /**
   * 3) Map code -> service detail (untuk label + category matching)
   */
  const serviceMap = useMemo(() => {
    const map = new Map();
    (requiredServices || []).forEach((s) => {
      if (s?.code) map.set(String(s.code), s);
    });
    return map;
  }, [stableKey((requiredServices || []).map((s) => s?.code))]);

  /**
   * 4) assignment state (yang bisa diupdate admin via UI)
   * Saat draft berubah (mis. admin lain update), state ikut update.
   */
  const [assignment, setAssignment] = useState({});

  useEffect(() => {
    // kalau draft ada, hydrate
    if (draft) setAssignment(assignmentFromDraft(draft));
    // kalau draft null (belum ada), reset
    if (!draft && !draftLoading) setAssignment({});
  }, [draft, draftLoading]);

  /**
   * 5) Kandidat per service_code (filter + sorting)
   */
  const candidatesByService = useMemo(() => {
    const out = {};
    const codes = (requiredServiceCodes || []).filter(Boolean).map(String);

    codes.forEach((code) => {
      const service = serviceMap.get(code);
      const serviceCategory = service?.category;

      const filtered = (vendors || [])
        .filter((v) => Array.isArray(v.supported_services) && v.supported_services.includes(code))
        .filter((v) => (v.status ? v.status === "idle" : true))
        .filter((v) => {
          // city optional: kalau kosong => unrestricted
          if (!eventCity) return true;
          return Array.isArray(v.service_area) && v.service_area.includes(eventCity);
        })
        .filter((v) => (serviceCategory ? v.category === serviceCategory : true));

      // Sorting: Premium dulu, lalu cost termurah
      filtered.sort((a, b) => {
        const tierRank = (t) => (t === "Premium" ? 1 : t === "Standard" ? 2 : 3);
        const r = tierRank(a?.tier) - tierRank(b?.tier);
        if (r !== 0) return r;
        return (a?.cost_per_unit || 0) - (b?.cost_per_unit || 0);
      });

      out[code] = filtered;
    });

    return out;
  }, [vendors, stableKey(requiredServiceCodes), eventCity, serviceMap]);

  /**
   * 6) Pilih & batalkan vendor untuk 1 service_code
   * Ini menggantikan dropdown sepenuhnya.
   */
  function pickVendor(serviceCode, vendorKey) {
    setAssignment((prev) => ({ ...prev, [String(serviceCode)]: String(vendorKey) }));
  }

  function unpickVendor(serviceCode) {
    setAssignment((prev) => {
      const next = { ...prev };
      delete next[String(serviceCode)];
      return next;
    });
  }

  /**
   * 7) Save draft: create/update otomatis (merge: true)
   * setDoc di DbContext kamu sudah tersedia. :contentReference[oaicite:4]{index=4}
   */
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setSaveErr(null);

      const assignedVendors = Object.entries(assignment).map(([service_code, vendor_key]) => {
        const v = (vendors || []).find((x) => String(x.uid ?? x.id) === String(vendor_key));
        return {
          service_code: String(service_code),
          vendor_key: String(vendor_key),
          vendor_uid: v?.uid ?? null,
          vendor_name: v?.name ?? null,
          cost_per_unit: v?.cost_per_unit ?? null,
          pricing_unit: v?.pricing_unit ?? null,
          category: v?.category ?? null,
          tier: v?.tier ?? null,
          assignment_status: v?.assignment_status ?? "requested",
        };
      });

      // ✅ INDEKS supaya bisa di-query
      const assigned_vendor_uids = uniq(
        assignedVendors.map((x) => x.vendor_uid).filter(Boolean)
      );

      // opsional: kalau kamu lebih sering pakai vendor_key daripada vendor_uid
      const assigned_vendor_keys = uniq(
        assignedVendors.map((x) => x.vendor_key).filter(Boolean)
      );

      await setDoc(
        "vendor_assignments",
        String(bookingId),
        {
          booking_id: String(bookingId),
          assigned_vendors: assignedVendors,
          assigned_vendor_uids,
          assigned_vendor_keys,
          draft_status: "draft",
          updated_at: serverTimestamp(),
          created_at: draft?.created_at ?? serverTimestamp(),
        },
        { merge: true }
      );

      setSaving(false);
    } catch (e) {
      console.error(e);
      setSaveErr(e);
      setSaving(false);
    }
  }

  const loading = draftLoading || vendorsLoading;
  const error = draftError || vendorsError;

  if (loading) return <p>Loading vendor assignment...</p>;
  if (error) return <p style={{ color: "red" }}>Gagal load data vendor assignment.</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontWeight: 700 }}>Vendor Assignment Draft</h3>
        <button onClick={onClose} style={{ fontSize: 12 }}>
          Tutup
        </button>
      </div>

      {(requiredServiceCodes || []).filter(Boolean).map((code) => {
        const service = serviceMap.get(String(code));
        const candidates = candidatesByService[String(code)] || [];
        const selectedKey = assignment[String(code)] || "";

        return (
          <div key={String(code)} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{String(service?.label ?? code)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Code: {String(code)}
                {service?.category ? ` • Category: ${service.category}` : ""}
                {eventCity ? ` • Kota: ${eventCity}` : " • Kota: (unrestricted)"}
              </div>

              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
                Status pilihan:{" "}
                {selectedKey ? <span style={{ fontWeight: 700 }}>Sudah dipilih</span> : <span style={{ color: "#999" }}>Belum dipilih</span>}
              </div>
            </div>

            {candidates.length === 0 ? (
              <div style={{ marginTop: 10, fontSize: 13, color: "#ffb020" }}>
                Tidak ada vendor yang cocok (cek area, status, atau kategori).
              </div>
            ) : (
              <VendorCandidatesCollapsible
                candidates={candidates}
                requiredServiceCodes={requiredServiceCodes}
                serviceMap={serviceMap}
                selectedVendorKey={selectedKey}
                serviceCode={String(code)}
                onPick={(vendorKey) => pickVendor(code, vendorKey)}
                onUnpick={() => unpickVendor(code)}
              />
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>

        <span style={{ fontSize: 12, opacity: 0.8 }}>
          Draft ini akan tetap tersimpan dan otomatis kebaca lagi saat komponen dibuka.
        </span>
      </div>

      {saveErr && <p style={{ color: "red" }}>Gagal simpan draft. Cek console untuk detail.</p>}
    </div>
  );
}
