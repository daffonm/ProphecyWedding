"use client";

import { useMemo, useState } from "react";

import { useDb } from "@/context/DbContext";
import { useCollection } from "@/hooks/useCollection";
import { formatRupiah } from "@/utils/format";

import LoadingSkeleton from "@/components/LoadingSkeleton";

function safeTrim(v) {
  return String(v ?? "").trim();
}

export default function PackagePhase({
  packages,
  packagesLoading,
  packagesError,
  packageList,
  setPackageList,
  onNext,
  error,
}) {
  const { colRef, query } = useDb();

  // Multi-detail open: { [pkgCode]: true }
  const [openDetails, setOpenDetails] = useState({});

  const toggleDetail = (pkgCode) => {
    setOpenDetails((prev) => {
      const next = { ...prev };
      if (next[pkgCode]) delete next[pkgCode];
      else next[pkgCode] = true;
      return next;
    });
  };

  // selected package code (buat highlight + payload)
  const [selectedPkg, setSelectedPkg] = useState("");

  // khusus custom: checked service codes
  const [addOns, setAddOns] = useState([]); // array of service.code

  const pkgStyle = "rounded-xl w-80";

  // Fetch ALL Services once
  const allServicesQuery = useMemo(() => {
    return () => query(colRef("Services"));
  }, [colRef, query]);

  const {
    rows: allServices,
    loading: allServicesLoading,
    error: allServicesError,
  } = useCollection(allServicesQuery, [], { enabled: true });

  // ---- Helpers: grouping by category
  const getCategory = (s) => s?.category || "Uncategorized";
  const getServiceLabel = (s) => s?.label || s?.name || s?.code || "-";

  function groupByCategory(services) {
    const map = new Map();

    for (const s of services) {
      const cat = getCategory(s);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(s);
    }

    // urutkan service dalam kategori
    for (const [cat, arr] of map.entries()) {
      arr.sort((a, b) =>
        String(getServiceLabel(a)).localeCompare(String(getServiceLabel(b)), "id-ID")
      );
    }

    // urutkan kategori
    const entries = Array.from(map.entries());
    entries.sort((a, b) => String(a[0]).localeCompare(String(b[0]), "id-ID"));
    return entries;
  }

  // Checkbox toggle (untuk custom)
  const handleToggleAddOn = (serviceCode) => {
    setAddOns((prev) => {
      if (prev.includes(serviceCode)) return prev.filter((c) => c !== serviceCode);
      return [...prev, serviceCode];
    });
  };

  function ServicesGroupedView({ services = [], pkgCode }) {
    if (!services.length) return <div className="text-xs text-gray-500">No services.</div>;

    const grouped = groupByCategory(services);
    const isCustom = pkgCode === "CUSTOM";

    return (
      <div className="flex flex-col gap-4">
        {grouped.map(([cat, arr]) => (
          <div key={cat} className="flex flex-col">
            <p className="text-xs text-yellow-700 font-semibold">{cat}</p>

            <div className="flex flex-col pl-2">
              {arr.map((s) => {
                const code = s.code;
                const checked = isCustom ? addOns.includes(code) : true;

                return (
                  <div key={s.id} className="flex flex-row gap-2">
                    {isCustom ? (
                      <input
                        type="checkbox"
                        name={getServiceLabel(s)}
                        checked={checked}
                        onChange={() => handleToggleAddOn(code)}
                        id={s.id}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        name={getServiceLabel(s)}
                        checked
                        readOnly
                        id={s.id}
                      />
                    )}

                    <p className="text-sm text-gray-800">{getServiceLabel(s)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // CUSTOM: tampilkan semua services (grouped) + checkbox
  function CustomPackageServices() {
    if (allServicesLoading) return <LoadingSkeleton />;
    if (allServicesError) return <div className="text-xs text-red-500">Failed load services</div>;
    if (!allServices || allServices.length === 0)
      return <div className="text-xs text-gray-500">No services found.</div>;

    return <ServicesGroupedView services={allServices} pkgCode="CUSTOM" />;
  }

  // Package normal: filter allServices by included codes (grouped)
  function PackageServicesByCodes({ serviceCodes = [] }) {
    const codes = Array.isArray(serviceCodes) ? serviceCodes.filter(Boolean) : [];

    if (allServicesLoading) return <LoadingSkeleton />;
    if (allServicesError) return <div className="text-xs text-red-500">Failed load services</div>;
    if (!codes.length) return <div className="text-xs text-gray-500">No included services.</div>;

    const codeSet = new Set(codes);
    const filtered = (allServices || []).filter((s) => codeSet.has(s.code));

    if (!filtered.length)
      return <div className="text-xs text-gray-500">No matching services found.</div>;

    return <ServicesGroupedView services={filtered} pkgCode="NORMAL" />;
  }

  const validate = () => {
    if (!safeTrim(packageList)) return "Pilih package dulu.";

    const isCustom = selectedPkg === "CUSTOM";
    if (isCustom && addOns.length < 1) return "Custom package wajib pilih minimal 1 service.";

    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });

    const isCustom = selectedPkg === "CUSTOM";

    // 🔥 kirim payload selected booking + checked services
    await onNext({
      ok: true,
      selectedPkgCode: selectedPkg,
      selectedPkgName: packageList, // ini sudah kamu set saat select
      isCustom,
      checkedServiceCodes: isCustom ? addOns : [],
    });
  };

  return (
    <div className="h-full w-full flex flex-col justify-between min-h-0">
      {/* scroll only here */}
      <div className="h-full w-full overflow-y-scroll flex flex-col items-center pb-30 min-h-0">
        {error ? <div className="text-red-600">{error}</div> : null}
        {packagesError ? <div className="text-red-600">{String(packagesError)}</div> : null}

        <div className="h-35 flex flex-col items-center">
          <h2 className="text-2xl">Choose a Wedding Plan</h2>
          <div>
            {selectedPkg && (
              <p className="">
                {packages.find((p) => p.code === selectedPkg)?.description}
              </p>
            )}
          </div>
        </div>

        {packagesLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="w-full">
            {/* items-start: supaya card lain tidak ikut stretch */}
            <div className="flex flex-row justify-center gap-8 items-start">
              {packages.map((pkg, id) => {
                const isSelected = selectedPkg === pkg.code;
                const isDetailed = Boolean(openDetails[pkg.code]);
                const isCustom = pkg.code === "CUSTOM";

                const baseHeightClass = "h-100";

                return (
                  <div
                    key={id}
                    className={(isSelected ? "bd" : "bd-2") + " " + pkgStyle}
                  >
                    {/* BASE AREA */}
                    <div className={"flex flex-col justify-between " + baseHeightClass + " pt-20 pb-10"}>
                      <div className="flex flex-col items-center gap-2">
                        <h2 className="section-title text-xl">{pkg.name}</h2>

                        <div className="flex flex-col items-center">
                          <p className="text-xs">{pkg.code === "CUSTOM" ? "Up to" : "Start From"}</p>
                          <p className="bold">
                            {pkg.code === "CUSTOM" ? "Rp. 500.000.000" : formatRupiah(pkg.base_price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <button
                          className={`${isSelected ? "button2-inactive" : "button2"} w-50 rounded-lg`}
                          onClick={() => {
                            setSelectedPkg(pkg.code);
                            setPackageList(pkg.name);

                            // kalau pindah dari custom ke non-custom, reset addOns supaya tidak kebawa
                            if (pkg.code !== "CUSTOM") setAddOns([]);
                          }}
                        >
                          Select Package
                        </button>

                        <button
                          className="text-xs underline text-gray-500"
                          onClick={() => toggleDetail(pkg.code)}
                        >
                          {isDetailed ? "Hide" : "Show"} Detailed
                        </button>
                      </div>
                    </div>

                    {/* DETAIL AREA */}
                    {isDetailed && (
                      <div className="flex flex-col px-4 pb-6">
                        {isCustom ? (
                          <>
                            <CustomPackageServices />
                            <div className="text-xs text-gray-500 mt-2">
                              Selected: {addOns.length}
                            </div>
                          </>
                        ) : (
                          <PackageServicesByCodes serviceCodes={pkg.included_services || []} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer pinned */}
      <div className="flex flex-row justify-end pr-8">
        {selectedPkg ? 
            selectedPkg === "CUSTOM" ?  
             addOns.length > 0 ? <button className="button2 rounded-lg w-50" onClick={handleNext}>Next</button> : <button className="button-grayed rounded w-50">Next</button>
            :
            <button className="button2 rounded-lg w-50" onClick={handleNext}>
                Next
            </button> 
         : (
          <button className="button-grayed rounded w-50">Next</button>
        )}
      </div>
    </div>
  );
}
