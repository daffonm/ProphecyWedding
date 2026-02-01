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
  const { user, role, loading, profileLoading } = useAuth();
  const { query, colRef, orderBy, setDoc, serverTimestamp } = useDb();

  // ===== redirect ke login + balik lagi ke sini
  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) navigateWithOrigin(router, "/login"); // /login?next=/vendor/join-us
  }, [user, loading, profileLoading, router]);

  // ===== kalau role sudah vendor -> langsung ke vendor hub
  useEffect(() => {
    if (loading || profileLoading) return;
    if (user && role === "vendor") router.replace("/vendor-hub");
  }, [user, role, loading, profileLoading, router]);

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
    name: "",
    pic_name: "",
    phone: "",
    category: "",
    service_area: [],
  });

  const [selectedServiceCodes, setSelectedServiceCodes] = useState([]);
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleServiceCode = (code, checked) => {
    setSelectedServiceCodes((prev) => {
      if (checked) return uniq([...prev, code]);
      return prev.filter((x) => x !== code);
    });
  };

  const canConfirm = useMemo(() => {
    return (
      isFilled(form.name) &&
      isFilled(form.pic_name) &&
      isFilled(form.phone) &&
      isFilled(form.category)
    );
  }, [form.name, form.pic_name, form.phone, form.category]);

  async function confirmSubmission() {
    if (!user?.uid) return;

    if (!canConfirm) {
      alert("Lengkapi data wajib: Perusahaan, PIC, HP/WA, Kota, dan Kategori.");
      return;
    }

    try {
      setBusy(true);

      const uid = user.uid;

      // 1) Simpan data vendor ke Vendors/{uid}
      await setDoc(
        "Vendors",
        uid,
        {
          uid,
          type: "profile",

          name: String(form.name || "").trim(),
          pic_name: String(form.pic_name || "").trim(),
          phone: String(form.phone || "").trim(),
          category: String(form.category || "").trim(),

          service_area: uniq(form.service_area),
          supported_services: uniq(selectedServiceCodes),

          // auto fields (tanpa ditampilkan di form)
          status: "pending",
          tier: "Standard",

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2) Set role user -> vendor-pending (nanti admin yang ubah ke vendor)
      await setDoc(
        "Users",
        uid,
        {
          role: "vendor-pending",
          vendor_status: "pending",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Setelah role berubah, UI akan otomatis berubah (berdasarkan role).
      // Tapi untuk memastikan cepat, bisa redirect ke vendor hub juga:
    //   router.replace("/vendor-hub");
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
  if (role === "vendor-pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-xl bg-white rounded-2xl border p-6 text-center">
          <div className="text-2xl font-bold">Your registration request has been sent</div>
          <div className="mt-2 text-sm opacity-70">
            Please wait for our admin to review and approve your request.
          </div>

          <button
            className="mt-6 px-4 py-2 rounded-lg bg-emerald-600 text-white"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ===== Form normal untuk customer (atau role lain yang belum vendor-pending)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl border p-6">
        <div className="mb-4">
          <div className="text-2xl font-bold">Vendor Registration</div>
          <div className="text-sm opacity-70">
            Isi data, lalu klik Confirm Pengajuan.
          </div>
        </div>

        <div className="grid gap-3">
          <input
            className="border rounded-lg p-2"
            placeholder="Nama Perusahaan *"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />

          <input
            className="border rounded-lg p-2"
            placeholder="Nama PIC *"
            value={form.pic_name}
            onChange={(e) => setField("pic_name", e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border rounded-lg p-2"
              placeholder="No HP/WA *"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
         
          </div>

          <select
            className="border rounded-lg p-2"
            value={form.category || ""}
            onChange={(e) => setField("category", e.target.value)}
            disabled={allServicesLoading}
          >
            <option value="" disabled>
              Pilih Kategori *
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>


          <div className="mt-2">
            <div className="text-sm font-semibold mb-2">Supported Services (optional)</div>

            {!form.category ? (
              <div className="text-sm opacity-70">Pilih kategori dulu.</div>
            ) : (
              <div className="space-y-2">
                {allServices
                  .filter((s) => s.category === form.category)
                  .map((s) => {
                    const code = s.code || s.id;
                    const checked = selectedServiceCodes.includes(code);

                    return (
                      <label key={s.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleServiceCode(code, e.target.checked)}
                        />
                        <span>{s.label}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>

          <ServiceAreaEditor value={form.service_area} onChange={(next) => setField("service_area", next)} />

          <button
            disabled={!canConfirm || busy}
            className={`mt-4 px-4 py-2 rounded-lg text-white ${
              canConfirm && !busy ? "bg-emerald-600" : "bg-gray-400"
            }`}
            onClick={confirmSubmission}
          >
            {busy ? "Mengirim…" : "Confirm Pengajuan"}
          </button>

          <button className="px-4 py-2 rounded-lg border" onClick={() => router.push("/")}>
            Back to Home
          </button>
        </div>
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
