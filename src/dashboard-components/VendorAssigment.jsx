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

// Helper: konsistenkan identifier vendor yang dipakai di assignment.
// Di data kamu ada vendor.uid atau vendor.id. Di draft kita simpan vendor_key.
function getVendorKey(v) {
  return String(v?.uid ?? v?.id ?? "");
}

function formatRupiah(value) {
  try {
    return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
  } catch {
    return "Rp0";
  }
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "accepted" || s === "approved") return "text-green-500 text-xs";
  if (s === "rejected") return "text-red-500 text-xs";
  // default requested / draft
  return "text-yellow-600 text-sm";
}


// Catatan: versi awal menggunakan ServicePill untuk menampilkan supported services.
// Requirement terbaru minta "serviceBar" untuk assignment per service, jadi komponen pill tidak dipakai.

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

  // Sidebar kiri menentukan service aktif untuk panel "Available".
  // Panel "Assigned Vendors" TIDAK terfilter oleh service aktif (sesuai requirement).
  const [activeServiceCode, setActiveServiceCode] = useState("");

  // Default active service: yang paling atas.
  useEffect(() => {
    if (activeServiceCode) return;
    const first = requiredServices?.[0]?.code ?? requiredServiceCodes?.[0];
    if (first) setActiveServiceCode(String(first));
  }, [activeServiceCode, stableKey(requiredServiceCodes), stableKey((requiredServices || []).map((s) => s?.code))]);

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
    setAssignment((prev) => {
      const next = { ...prev, [String(serviceCode)]: String(vendorKey) };
      // autosave setiap klik assign
      handleSaveDraft(next);
      return next;
    });
  }

  function unpickVendor(serviceCode) {
    setAssignment((prev) => {
      const next = { ...prev };
      delete next[String(serviceCode)];
      // autosave setiap klik unassign
      handleSaveDraft(next);
      return next;
    });
  }

  // Status assignment berasal dari draft (realtime). Ini dipakai untuk tampilan di panel Assigned Vendors.
  // Key: service_code::vendor_key -> assignment_status
  const statusIndex = useMemo(() => {
    const idx = new Map();
    const list = draft?.assigned_vendors;
    if (!Array.isArray(list)) return idx;
    list.forEach((r) => {
      if (!r?.service_code || !r?.vendor_key) return;
      idx.set(`${String(r.service_code)}::${String(r.vendor_key)}`, String(r.assignment_status || ""));
    });
    return idx;
  }, [draft]);

  // Reverse mapping: vendor_key -> array service_code yang di-assign ke vendor tsb.
  // Ini yang membuat panel Assigned Vendors menampilkan semua vendor yang punya 1 atau lebih service assigned.
  const assignedServicesByVendor = useMemo(() => {
    const out = new Map();
    Object.entries(assignment || {}).forEach(([serviceCode, vendorKey]) => {
      if (!serviceCode || !vendorKey) return;
      const vk = String(vendorKey);
      const sc = String(serviceCode);
      const prev = out.get(vk) || [];
      out.set(vk, [...prev, sc]);
    });
    return out;
  }, [assignment]);

  // List vendor yang assigned untuk panel atas (tidak terfilter service aktif)
  const assignedVendorsAll = useMemo(() => {
    const keys = Array.from(assignedServicesByVendor.keys());
    if (!keys.length) return [];
    return (vendors || []).filter((v) => keys.includes(getVendorKey(v)));
  }, [vendors, assignedServicesByVendor]);

  // Panel bawah: vendor available berdasarkan service aktif saja.
  // Penting: vendor yang sudah di-assign untuk service aktif tetap ditampilkan (biar box tidak hilang).
  const availableVendorsForActive = useMemo(() => {
    if (!activeServiceCode) return [];
    return candidatesByService?.[String(activeServiceCode)] || [];
  }, [candidatesByService, activeServiceCode]);

  // Sidebar summary: jumlah vendor assigned per service dan estimasi cost (pakai cost_per_unit vendor)
  const sidebarStats = useMemo(() => {
    const stats = {};
    (requiredServices || []).forEach((s) => {
      if (!s?.code) return;
      const sc = String(s.code);
      const vk = String(assignment?.[sc] || "");
      const vendor = (vendors || []).find((v) => getVendorKey(v) === vk);
      
      stats[sc] = {
        assignedCount: vk ? 1 : 0,
        estimated: vendor?.cost_per_unit ?? 0,
        pricingUnit: vendor?.pricing_unit ?? "",
      };
    });
    return stats;
  }, [assignment, vendors, stableKey((requiredServices || []).map((s) => s?.code))]);

  /**
   * 7) Save draft: create/update otomatis (merge: true)
   * setDoc di DbContext kamu sudah tersedia. :contentReference[oaicite:4]{index=4}
   */
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  async function handleSaveDraft(nextAssignment) {
    try {
      setSaving(true);
      setSaveErr(null);


      const sourceAssignment = nextAssignment ?? assignment;

      const prevStatus = new Map(
        ((draft?.assigned_vendors || [])).map((x) => [
          `${String(x.service_code)}::${String(x.vendor_key)}`,
          x.assignment_status ?? "",
        ])
      );

      const assignedVendors = Object.entries(sourceAssignment).map(([service_code, vendor_key]) => {
        const v = (vendors || []).find((x) => String(x.uid ?? x.id) === String(vendor_key));
        return {
          service_code: String(service_code),
          vendor_key: String(vendor_key),
          vendor_uid: v?.uid ?? null,
          vendor_name: v?.name ?? null,
          cost_per_unit: v?.service_pricing?.[String(service_code)]?.cost_per_unit ?? null,
          pricing_unit: v?.service_pricing?.[String(service_code)]?.pricing_unit ?? null,
          category: v?.category ?? null,
          tier: v?.tier ?? null,
          assignment_status: (() => {
            const k = `${String(service_code)}::${String(vendor_key)}`;
            const prev = prevStatus.get(k);
            const val = (prev ?? "");
            return String(val).trim() ? String(val) : "requested";
          })(),
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


  // UI TOGGLES
  const [displayAssigned, setDisplayAssigned] = useState(false)

  const loading = draftLoading || vendorsLoading;
  const error = draftError || vendorsError;

  if (loading) return <p>Loading vendor assignment...</p>;
  if (error) return <p style={{ color: "red" }}>Gagal load data vendor assignment.</p>;




  return (
    <div className="flex flex-row h-full">

      {/* Side */}
      <div className="w-90 border-r-2 border-gray-300 p-4 overflow-y-scroll no-scrollbar bg-white">
        <button onClick={onClose}>X</button>
        <h1 className="text-2xl">Required Services</h1>

        {/* Services Container */}
        <div className="flex flex-col items-start gap-2">
          {requiredServices.map((s, idx) => {
            const code = String(s?.code || "");
            const isActive = code && code === String(activeServiceCode);
            const stat = sidebarStats?.[code] || { assignedCount: 0, estimated: 0, pricingUnit: "" };

            return (
              <button
                key={`${code}::${idx}`}
                onClick={() => setActiveServiceCode(code)}
                className={[
                  "border p-2 flex flex-col items-start rounded-xl transition-all duration-500 ease-in-out",
                  isActive ? `bg-blue-200 ${stat.assignedCount > 0 && "w-full"}` : (stat.assignedCount > 0 ? "border-blue-500 w-full" : "border-gray-300"),
                ].join(" ")}
              >
                <div>
                  <p>{s.label}</p>
                </div>
                
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <div className="w-full p-8">

          <div className="flex flex-col w-full">
            
            <div className="w-full">
              <button
              className="w-full border-gray-300 flex flex-row justify-start items-center border-b-2"
                onClick={() => setDisplayAssigned(!displayAssigned)}>
                <h1 className="text-xl flex flex-row items-center justify-center">{`Assigned Vendors (${assignedVendorsAll.length})`}</h1>
              </button>

              {/* Horizontal Scroll Container */}
              {displayAssigned && 
                <div className="overflow-x-scroll no-scrollbar w-268">
                  <div className="flex flex-row gap-6 overflow-x-scroll no-scrollbar w-full">
                    {assignedVendorsAll.length ? (
                      assignedVendorsAll.map((v) => (
                        <AssignedVendorBox
                          key={getVendorKey(v)}
                          vendor={v}
                          serviceCodes={assignedServicesByVendor.get(getVendorKey(v)) || []}
                          serviceMap={serviceMap}
                          statusIndex={statusIndex}
                          onUnassign={(serviceCode) => unpickVendor(serviceCode)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">Belum ada vendor yang di-assign.</p>
                    )}
                  </div>
                </div>
              }

            </div>

            <div className="w-full mt-4">
              <h1 className="text-xl">
                List Available by Service : {serviceMap.get(String(activeServiceCode))?.label || String(activeServiceCode || "-")}
              </h1>

              {/* Vertical Scroll Container */}
              <div className="vertical-x-scroll no-scrollbar">
                <div className="flex flex-row gap-6">
                  {availableVendorsForActive.length ? (
                    availableVendorsForActive.map((v) => (
                      <UnassignedVendorBox
                        key={`${getVendorKey(v)}::${String(activeServiceCode)}`}
                        vendor={v}
                        requiredServiceCodes={requiredServiceCodes}
                        activeServiceCode={String(activeServiceCode)}
                        serviceMap={serviceMap}
                        assignment={assignment}
                        statusIndex={statusIndex}
                        onAssign={(serviceCode) => pickVendor(serviceCode, getVendorKey(v))}
                        onUnassign={(serviceCode) => unpickVendor(serviceCode)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Tidak ada vendor available untuk service ini.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Draft final handleSave dan tombolnya jangan diubah strukturnya, cuma ditampilkan di sini */}
            <div className="mt-8 flex items-center gap-3">
              <button
                className="border px-4 py-2 rounded-xl"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              {saveErr ? <p className="text-sm text-red-500">Gagal save draft</p> : null}
            </div>



          </div>
        </div>
      </div>

    </div>
    
  );
}

// ServiceBar: pengganti service pill.
// Di Assigned Vendor: tampil service name + harga + status + tombol X
// Di Available Vendor: tampil service name + harga + tombol Assign
function ServiceBar({
  v,
  s,
  label,
  status,
  showStatus = false,
  onAssign,
  onUnassign,
}) {

  const price = v?.service_pricing[s]?.cost_per_unit ?? 0;
  const unit = v?.service_pricing[s]?.pricing_unit ?? "";


  return (
    <div className="flex flex-row gap-6 items-center justify-between">
      <div className="flex flex-col">
        <p className="text-xs bold">{label}</p>
        <p className="text-sm">
          {formatRupiah(price)}{unit ? `/${unit}` : ""}
        </p>

      </div>

    <div className="flex flex-row gap-4 items-center">
        {showStatus && status ? (
          <div className="flex flex-row gap-1 items-center">
            <p className={statusClass(status)}>{String(status)}</p>
          </div>
        ) : null}

        {onAssign ? (
          <button className="border py-1 px-1 rounded-lg text-xs" onClick={onAssign}>
            Assign
          </button>
        ) : null}

        {onUnassign ? (
          <button className="text-red-500" onClick={onUnassign} title="Unassign">
            X
          </button>
        ) : null}

    </div>
    </div>
  );
}

function AssignedVendorBox({ vendor, serviceCodes = [], serviceMap, statusIndex, onUnassign }) {
  const vendorKey = getVendorKey(vendor);

  return (
    <div className="bd-6 bg-white p-4 w-200">
      <div className="flex flex-row gap-10">
        <div>
          <div className="bg-gray-500 w-15 h-15 rounded-full"></div>
          <div className="flex flex-col">
            <p className="bold text-sm w-30">{vendor?.name ?? "-"}</p>
            <p className="text-xs">{vendor?.description ?? ""}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-row items-center gap-2">
            <div className="rounded-full bg-yellow-500 w-5 h-5"></div>
            <p>{vendor?.category ?? "Category"}</p>
          </div>

          <div className="flex flex-col">
            <p className="text-sm">Services </p>
            <div className="flex flex-col gap-2">
              {serviceCodes.length ? (
                serviceCodes.map((sc) => {
                  const svc = serviceMap?.get?.(String(sc));
                  const label = svc?.label ?? String(sc);
                  const status = statusIndex?.get?.(`${String(sc)}::${vendorKey}`) || "requested";

                  return (
                    <ServiceBar
                      key={`${vendorKey}::${String(sc)}`}
                      label={label}
                      price={vendor?.cost_per_unit ?? 0}
                      unit={vendor?.pricing_unit ?? ""}
                      status={status}
                      showStatus={true}
                      onUnassign={() => onUnassign?.(String(sc))}
                    />
                  );
                })
              ) : (
                <p className="text-sm text-gray-600">No assigned services</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function UnassignedVendorBox({
  vendor,
  requiredServiceCodes = [],
  activeServiceCode = "",
  serviceMap,
  assignment,
  statusIndex,
  onAssign,
  onUnassign,
}) {
  const vendorKey = getVendorKey(vendor);
  const serviceCode = String(activeServiceCode || "");
  const label = serviceMap?.get?.(serviceCode)?.label ?? serviceCode;

  const isRequired = (requiredServiceCodes || []).map(String).includes(serviceCode);
  const isAssigned = String(assignment?.[serviceCode] || "") === vendorKey;
  const statusRaw = statusIndex?.get?.(`${serviceCode}::${vendorKey}`) ?? "";
  const status = String(statusRaw || "");

  // Aksi hanya untuk service required
  const allowAssign = isRequired && !isAssigned;
  const allowUnassign = isRequired && isAssigned;

  return (
    <div className="bd-6 bg-white p-4 w-80 h-100">
      <div className="flex flex-col items-center">
        <div className="w-15 h-15 bg-gray-500 rounded-full"></div>
        <p className="bold">{vendor?.name ?? "-"}</p>
        <p className="">{vendor?.description ?? ""}</p>
        <div className="flex flex-row items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <p className="text-sm">{vendor?.category ?? "Category"}</p>
        </div>

        <div className="mt-4 w-full">
          <div className="flex flex-col gap-2">
            <ServiceBar
              v={vendor}
              s={serviceCode}
              label={label}
              // tampilkan status hanya kalau required dan statusnya memang ada
              showStatus={Boolean(isRequired && status)}
              status={status}
              onAssign={allowAssign ? () => onAssign?.(serviceCode) : null}
              onUnassign={allowUnassign ? () => onUnassign?.(serviceCode) : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

