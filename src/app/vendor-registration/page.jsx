"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { navigateWithOrigin } from "@/utils/navigation"; // sesuaikan path file navigation.js kamu
import LoadingSkeleton from "@/components/LoadingSkeleton";

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}
function isFilled(v) {
  return String(v || "").trim().length > 0;
}




export default function VendorJoinUsPage() {
  const router = useRouter();
  const { user, userDoc, role, loading, profileLoading } = useAuth();
  const { query, colRef, orderBy, setDoc, addDoc, serverTimestamp } = useDb();
  // UI STATES
  const [phase, setPhase] = useState(1);
  const handleNext = () => {
    setPhase(prev => prev + 1)
  }
  const handleBack = () => {
    setPhase(prev => prev - 1)
  }
  
  // ===== redirect ke login + balik lagi ke sini
  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) navigateWithOrigin(router, "/login"); // /login?next=/vendor/join-us
  }, [user, userDoc, loading, profileLoading, router]);

  // ===== kalau role sudah vendor -> langsung ke vendor hub
  useEffect(() => {
    if (loading || profileLoading) return;
    if (user && role === "vendor") router.replace("/vendor-hub");
    if (user && role === "vendor-pending") setPhase(4)
  }, [user, role, phase, loading, profileLoading, router]);
  


  // ===== load list service (optional checkbox)
  const serviceQuery = useMemo(() => {
    return () => query(colRef("Services"), orderBy("label", "asc"));
  }, [colRef, query, orderBy]);

  const { rows: allServices = [], loading: allServicesLoading } = useCollection(serviceQuery, [], {
    enabled: true,
  });

  const categories = useMemo(() => {
    const set = new Set();
    for (const s of allServices) {
      if (s?.category) set.add(s.category);
    }
    return Array.from(set).sort();
  }, [allServices]);

  // ===== local form state (tier/status tidak ditampilkan)
  const [form, setForm] = useState({
    pic_name: "",
    phone: "",
    company_role: "",
    nik_number: "",

    name: "",
    description: "",
    address: "",
    city: "",
    service_area: [],
    website: "",
    instagram: "",
    bank_name: "",
    bank_account: "",
    bank_account_number: "",

    category: "",
    supported_services: [

    ],
  });

  
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  

  const PRICING_UNITS = [
  { value: "per_pax", label: "Pax" },
  { value: "per_hour", label: "Hour" },
  { value: "per_day", label: "Day" },
  { value: "per_event", label: "Event" },
];

const [selectedServiceCodes, setSelectedServiceCodes] = useState([]);

// serviceDraft: { [code]: { priceText: string, pricing_unit: string } }
const [serviceDraft, setServiceDraft] = useState({});

const sanitizeNumberText = (v) => String(v ?? "").replace(/[^\d]/g, ""); // hanya angka

const toggleServiceCode = (code, checked) => {
  setSelectedServiceCodes((prev) => {
    if (checked) return uniq([...prev, code]);
    return prev.filter((x) => x !== code);
  });

  setServiceDraft((prev) => {
    const next = { ...prev };
    if (checked) {
      // default ketika pertama kali dicentang
      if (!next[code]) next[code] = { priceText: "", pricing_unit: "per_event" };
    } else {
      delete next[code];
    }
    return next;
  });
};

const setServicePrice = (code, value) => {
  const priceText = sanitizeNumberText(value);
  setServiceDraft((prev) => ({
    ...prev,
    [code]: { ...(prev[code] ?? {}), priceText },
  }));
};

const setServiceUnit = (code, unit) => {
  setServiceDraft((prev) => ({
    ...prev,
    [code]: { ...(prev[code] ?? {}), pricing_unit: unit },
  }));
};



  const [busy, setBusy] = useState(false);
  

  const canConfirm = useMemo(() => {
  return (
    isFilled(form.name) &&
    isFilled(form.pic_name) &&
    isFilled(form.phone) &&
    isFilled(form.city) &&
    isFilled(form.category)
  );
}, [form.name, form.pic_name, form.phone, form.city, form.category]);


  async function confirmSubmission() {
  if (!user?.uid) return;

  // validasi minimal (sesuaikan kalau mau tambah city dll)
  if (!canConfirm) {
    alert("Lengkapi data wajib: Company Name, PIC, Phone, dan Category.");
    return;
  }

  // validasi pricing untuk service yang dipilih
  const service_pricing = {};
  for (const code of selectedServiceCodes) {
    const d = serviceDraft[code];
    const cost = Number((d?.priceText ?? "0").replace(/[^\d]/g, "")) || 0;
    const unit = d?.pricing_unit || "";

    if (cost <= 0 || !unit) {
      alert(`Lengkapi harga & pricing unit untuk service: ${code}`);
      return;
    }

    service_pricing[code] = { cost_per_unit: cost, pricing_unit: unit };
  }

  try {
    setBusy(true);
    const uid = user.uid;

    await addDoc(
      "Vendors",
      {
        user_id: uid,
        type: "profile",

        // phase 1
        pic_name: String(form.pic_name || "").trim(),
        phone: String(form.phone || "").trim(),
        company_role: String(form.company_role || "").trim(),
        nik_number: String(form.nik_number || "").trim(),

        // phase 2
        name: String(form.name || "").trim(),
        description: String(form.description || "").trim(),
        address: String(form.address || "").trim(),
        city: String(form.city || "").trim(),
        service_area: uniq(form.service_area),
        website: String(form.website || "").trim(),
        instagram: String(form.instagram || "").trim(),
        bank_name: String(form.bank_name || "").trim(),
        bank_account: String(form.bank_account || "").trim(),
        bank_account_number: String(form.bank_account_number || "").trim(),

        // phase 3
        category: String(form.category || "").trim(),
        supported_services: uniq(selectedServiceCodes),
        service_pricing,

        // auto
        status: "pending",
        tier: "Standard",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      "Users",
      uid,
      { role: "vendor-pending", updatedAt: serverTimestamp() },
      { merge: true }
    );

  } catch (err) {
    console.error("confirm vendor submission error:", err);
    alert("Gagal mengirim pengajuan. Coba lagi.");
  } finally {
    setBusy(false);
  }
}





  // ===== Loading gates
  if (loading || profileLoading) return <LoadingSkeleton />;
  if (!user) return null;

  // ===== UI sederhana: kalau role vendor-pending -> tampil Thank You
  

  // ===== Form normal untuk customer (atau role lain yang belum vendor-pending)
  return (
    <div className="flex flex-row h-182 items-center p-8">

        {/* left */}
        <div className="h-full w-120 bg-emerald-50 flex flex-col">
          {/* top */}
          <div className="pt-8 px-8 flex flex-col justify-between">
            <h2 className="text-2xl section-title">Prophecy Wedding</h2>
          </div>

          {/* Process */}
          <div className="p-8 flex flex-col gap-2">

            <h1 className="text-xl">Vendor Registration</h1>
              <div className="flex flex-row items-center gap-4">
                {/* circle */}
                <div className={`${phase >= 1 ? "bg-emerald-600 text-gray-100" : "bg-gray-200 text-gray-400"} 
                rounded-full w-10 h-10 flex items-center justify-center`}>
                  1
                </div>
                <p className={`${phase >= 1 ? "text-emerald-700 weight-bold" : "text-gray-400"}`}>Personal Detail</p>
              </div>
              {/* line */}
              <div className={`${phase >= 1 ? "bg-emerald-600" : "bg-gray-200"}
              h-12 w-1 ml-4.5 rounded-xl`}></div>


              <div className="flex flex-row items-center gap-4">
                {/* circle */}
                <div className={`${phase >= 2 ? "bg-emerald-600 text-gray-100" : "bg-gray-200 text-gray-400"} 
                rounded-full w-10 h-10 flex items-center justify-center`}>
                  2
                </div>
                <p className={`${phase >= 2 ? "text-emerald-700 weight-bold" : "text-gray-400"}`}>Vendor Detail</p>
              </div>
              {/* line */}
              <div className={`${phase >= 2 ? "bg-emerald-600" : "bg-gray-200"}
              h-12 w-1 ml-4.5 rounded-xl`}></div>
                
              <div className="flex flex-row items-center gap-4">
                {/* circle */}
                <div className={`${phase >= 3 ? "bg-emerald-600 text-gray-100" : "bg-gray-200 text-gray-400"} 
                rounded-full w-10 h-10 flex items-center justify-center`}>
                  3
                </div>
                <p className={`${phase >= 3 ? "text-emerald-700 weight-bold" : "text-gray-400"}`}>Product / Service Offer</p>
              </div>
              {/* line */}
              <div className={`${phase >= 3 ? "bg-emerald-600" : "bg-gray-200"}
              h-12 w-1 ml-4.5 rounded-xl`}></div>


              <div className="flex flex-row items-center gap-4">
                {/* circle */}
                <div className={`${phase >= 4 ? "bg-emerald-600 text-gray-100" : "bg-gray-200 text-gray-400"} 
                rounded-full w-10 h-10 flex items-center justify-center`}>
                  4
                </div>
                <p className={`${phase >= 4 ? "text-emerald-700 weight-bold" : "text-gray-400"}`}>Waiting Approval</p>
              </div>
      

          </div>

        </div>

        {/* right */}
        <div className="flex flex-col w-full h-full justify-between bg-gray-50 p-8">
          <div className="h-full flex flex-col justify-center px-8">

              {phase === 1 && (
                <div className="h-full">
                  <h1>Your Personal Details</h1>
                  <div className="pt-2 flex flex-col gap-10 h-full w-full">

                    <div className="flex flex-row gap-40 mb-15">
                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Fullname</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="Enter Full Name"
                          type="text"
                          value={form.pic_name}
                          onChange={(e) => setField("pic_name", e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Phone Number</p>
                        <input
                          className="bd-6 p-2 bg-white outline-emerald-500 text-sm"
                          placeholder="Enter Phone"
                          type="text"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">Company Role / Position</p>
                      <input
                        className="bd-6 p-2 bg-white outline-emerald-500 text-sm"
                        placeholder="Enter Role"
                        type="text"
                        value={form.company_role}
                        onChange={(e) => setField("company_role", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">National Citizenship Number (NIK)</p>
                      <input
                        className="bd-6 p-2 bg-white outline-emerald-500 text-sm"
                        placeholder="Enter NCN Number"
                        type="text"
                        value={form.nik_number}
                        onChange={(e) => setField("nik_number", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}


              {phase === 2 && (
                <div className="h-full overflow-y-scroll">
                  <h1>Vendor Profile</h1>
                  <div className="pt-2 flex flex-col gap-10 mb-14">

                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">Company Name</p>
                      <input
                        className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                        placeholder="Enter Company Name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">Company Description</p>
                      <input
                        className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                        placeholder="Enter Description"
                        type="text"
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                      />
                    </div>
                  </div>

                  <h1>Location and Area</h1>
                  <div className="pt-2 flex flex-col gap-10 mb-14">

                    <div className="flex flex-row gap-40">
                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Company Address</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="Enter Address"
                          type="text"
                          value={form.address}
                          onChange={(e) => setField("address", e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">City</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="City (Bandung)"
                          type="text"
                          value={form.city}
                          onChange={(e) => setField("city", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Service Area pakai editor yang kamu punya */}
                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">Service Area</p>
                      <ServiceAreaEditor
                        value={form.service_area}
                        onChange={(next) => setField("service_area", next)}
                      />
                    </div>
                  </div>

                  <h1>Website and Social Media Links</h1>
                  <div className="pt-2 flex flex-col gap-10 mb-14">

                    <div className="flex flex-row gap-40">
                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Company Website Url</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="www.YourVendorSite.com"
                          type="text"
                          value={form.website}
                          onChange={(e) => setField("website", e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Instagram</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="@vendorHub"
                          type="text"
                          value={form.instagram}
                          onChange={(e) => setField("instagram", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <h1>Vendor Payment Information</h1>
                  <div className="pt-2 flex flex-col gap-10 mb-34">
                    <div className="flex flex-col gap-1 w-70">
                      <p className="text-xs">Bank Name</p>
                      <input
                        className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                        placeholder="BCA / BNI / Mandiri"
                        type="text"
                        value={form.bank_name}
                        onChange={(e) => setField("bank_name", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-row gap-40">
                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Bank Account Name</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="Enter Account Name"
                          type="text"
                          value={form.bank_account}
                          onChange={(e) => setField("bank_account", e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 w-70">
                        <p className="text-xs">Bank Account Number</p>
                        <input
                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                          placeholder="3273xxxxxxxx"
                          type="text"
                          value={form.bank_account_number}
                          onChange={(e) => setField("bank_account_number", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {phase === 3 && 
              <div className="h-full overflow-y-scroll">
                  <h1>Vendor Category</h1>
                  <div className="pt-2 flex flex-col gap-10 mb-14">

                      <div className="flex flex-col gap-1 w-70">
                          <p className="text-xs">Select Category</p>
                          <select
                            className="bd-6 bg-white p-2 outline-emerald-500 text-sm"
                            value={form.category || ""}
                            onChange={(e) => setField("category", e.target.value)}
                          >
                            <option value="" disabled>Select category</option>
                            {allServicesLoading ? null : categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>

                      </div>
                      <div className="flex flex-col gap-1 w-70">
                          <p className="text-xs">Select Services</p>
                          <div className="pl-2">
                            {allServices
                              .filter((s) => s.category === form.category)
                              .map((s) => {
                                const code = s.code || s.id;
                                const checked = selectedServiceCodes.includes(code);
                                const draft = serviceDraft[code] ?? { priceText: "", pricing_unit: "per_event" };

                                return (
                                  <div key={s.id} className="flex flex-row items-center p-2 w-200 gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => toggleServiceCode(code, e.target.checked)}
                                    />

                                    <span className="w-60">{s.label}</span>

                                    {checked && (
                                      <div className="flex flex-row gap-4 items-center w-80">
                                        <p className="text-xs w-50">Prefered Price (Rp.)</p>
                                        <input
                                          className="bd-6 bg-white p-2 outline-emerald-500 text-sm w-80"
                                          placeholder="4000000"
                                          type="text"
                                          value={draft.priceText}
                                          onChange={(e) => setServicePrice(code, e.target.value)}
                                        />

                                        <p className="text-xs w-40">Pricing Unit</p>
                                        <select
                                          className="bd-6 bg-white p-1 outline-emerald-500 text-sm w-20"
                                          value={draft.pricing_unit}
                                          onChange={(e) => setServiceUnit(code, e.target.value)}
                                        >
                                          {PRICING_UNITS.map((u) => (
                                            <option key={u.value} value={u.value}>
                                              {u.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                          </div>
                      </div>
                  </div>

              </div>
              }

              {phase === 4 &&
              <div className="h-full overflow-y-scroll">
                  <h1 className="text-2xl">Vendor Registration Completed!</h1>
                  <p>Thank you for your registration, you will be informed soon while after our admin reviewed your submission</p>
                 

              </div>
              }

          </div>

          {/* Bottom Navi */}
          { phase != 4 ?
          <div className="flex flex-row justify-end w-full px-14 py-2 gap-20">

          
          
              {phase > 1 && 
              <button
              className={`button1 w-30`}
              onClick={handleBack}
              >Back</button>}

              {phase === 3 ? (
              <button
                className={`button2 w-30`}
                onClick={confirmSubmission}
                disabled={busy}
              >
                {busy ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                className={`button1 w-30`}
                onClick={handleNext}
              >
                Next
              </button>
            )}

          </div> : 
          <div className="flex flex-row justify-end w-full px-14 py-2 gap-20">
            <button 
            className= "button2 w-50"
            onClick={() => router.push("/")}
            >Back Home</button>
          </div>
          }

          

        </div>
    </div>
   
  );
}

function ServiceAreaEditor({ value, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = String(input || "").trim();
    if (!v) return;
    onChange(uniq([...(value || []), v]));
    setInput("");
  };

  const remove = (v) => onChange((value || []).filter((x) => x !== v));

  return (
    <div className="border rounded-lg p-3">
      <div className="text-sm font-semibold mb-2">Service Area (optional)</div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 text-sm"
          placeholder="Tambah area (contoh: Bandung), lalu Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
          onClick={add}
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {(value || []).length === 0 ? (
          <div className="text-sm opacity-70">Belum ada area.</div>
        ) : (
          value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm"
            >
              {v}
              <button type="button" className="text-xs opacity-70" onClick={() => remove(v)}>
                x
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
