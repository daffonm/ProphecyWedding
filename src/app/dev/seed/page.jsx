"use client";

import { useMemo, useState } from "react";
import { useDb } from "@/context/DbContext";

import { SERVICES, VENDORS, PACKAGES, VENUES, PRODUCT } from "@/utils/seedDummy";

/**
 * Drop this file anywhere in your project, e.g:
 * /app/dev/seed/page.jsx
 *
 * What it does:
 * - Lets you define "seedPlan" with many collections + docs.
 * - Click "Run Seed" to write all of them.
 * - Safe to re-run: docs with explicit ids are upserted (overwritten).
 *
 * Uses your DbContext API:
 * - setDoc(col, id, data)
 * - addDoc(col, data)
 * - serverTimestamp()
 * - getDoc(col, id)
 */

export default function FirestoreSeederPage() {
  const { setDoc, addDoc, getDoc, serverTimestamp } = useDb();

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg) => setLogs((prev) => [...prev, msg]);

  // =========================
  // EDIT YOUR DUMMY DATA HERE
  // =========================
  const seedPlan = useMemo(() => {
    return {
      // Example: New collection "Packages"
      // Packages: {
      //   mode: "setDoc",
      //   docs: [
      //     {
      //       id: "pkg_gold",
      //       data: {
      //         name: "Gold Package",
      //         price: 8500000,
      //         items: ["Photo", "Video", "Album"],
      //         createdAt: "SERVER_TIMESTAMP",
      //         updatedAt: "SERVER_TIMESTAMP",
      //       },
      //     },
      //     {
      //       id: "pkg_platinum",
      //       data: {
      //         name: "Platinum Package",
      //         price: 12500000,
      //         items: ["Photo", "Video", "Drone", "Album"],
      //         createdAt: "SERVER_TIMESTAMP",
      //         updatedAt: "SERVER_TIMESTAMP",
      //       },
      //     },
      //   ],
      // },

      // Example: New collection "Users" (dummy customers)
      // Users: {
      //   mode: "setDoc",
      //   docs: [
      //     {
      //       id: "dummy_cust_001",
      //       data: {
      //         uid: "dummy_cust_001",
      //         email: "cust1@dummy.test",
      //         username: "cust1",
      //         role: "customer",
      //         createdAt: "SERVER_TIMESTAMP",
      //         updatedAt: "SERVER_TIMESTAMP",
      //       },
      //     },
      //     {
      //       id: "dummy_cust_002",
      //       data: {
      //         uid: "dummy_cust_002",
      //         email: "cust2@dummy.test",
      //         username: "cust2",
      //         role: "customer",
      //         createdAt: "SERVER_TIMESTAMP",
      //         updatedAt: "SERVER_TIMESTAMP",
      //       },
      //     },
      //   ],
      // },

      // Example: Existing collection "Bookings"
      // - Use addDoc if you want auto document IDs

      Vendors : {
        mode: "addDoc",
        docs: VENDORS,
      },




    };
  }, []);

  // Replace "SERVER_TIMESTAMP" placeholders with serverTimestamp()
  const hydrateSpecialValues = (obj) => {
    if (obj === "SERVER_TIMESTAMP") return serverTimestamp();

    if (Array.isArray(obj)) return obj.map(hydrateSpecialValues);

    if (obj && typeof obj === "object") {
      const out = {};
      for (const [k, v] of Object.entries(obj)) out[k] = hydrateSpecialValues(v);
      return out;
    }

    return obj;
  };

  const runSeed = async () => {
    setRunning(true);
    setError(null);
    setLogs([]);

    try {
      log("Starting seed...");

      // Optional: sanity check that this page isn't accidentally used in production
      log("Tip: remove this page after dev.");

      const collections = Object.keys(seedPlan);

      for (const colName of collections) {
        const plan = seedPlan[colName];
        const mode = plan?.mode;
        const docs = plan?.docs || [];

        log(`Collection: ${colName} (${mode}), docs: ${docs.length}`);

        if (mode === "setDoc") {
          for (const item of docs) {
            if (!item || typeof item !== "object") {
              throw new Error(`setDoc butuh item object di collection ${colName}`);
            }

            // id WAJIB untuk setDoc
            const id = item.id;
            if (!id) {
              throw new Error(`setDoc mode butuh "id" di collection ${colName}. Contoh: { id:"xxx", data:{...} }`);
            }

            // Support 2 bentuk:
            // A) { id, data:{...} }
            // B) { id, ...fields } (object langsung)
            const payload = ("data" in item) ? item.data : (() => {
              const { id: _id, ...rest } = item;
              return rest;
            })();

            if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
              throw new Error(`setDoc payload kosong untuk ${colName}/${id}. Pastikan ada field selain id.`);
            }

            const data = hydrateSpecialValues(payload);
            await setDoc(colName, id, data);

            log(`  upserted: ${colName}/${id}`);
          }
        } else if (mode === "addDoc") {
          for (const item of docs) {
            const payload = item?.data ? item.data : item;
            const data = hydrateSpecialValues(payload || {});
            const ref = await addDoc(colName, data, { merge: true });
            log(`  added: ${colName}/${ref?.id || "(id unknown)"}`);
          }
        } else {
          throw new Error(`Unknown mode for ${colName}: ${String(mode)}`);
        }
      }

      log("✅ Seed done.");
    } catch (e) {
      console.error(e);
      setError(String(e?.message || e));
      log(`❌ Error: ${String(e?.message || e)}`);
    } finally {
      setRunning(false);
    }
  };

  const checkDoc = async () => {
    setError(null);
    setLogs([]);
    try {
      log("Checking sample docs...");
      const u1 = await getDoc("Users", "dummy_cust_001");
      log(`Users/dummy_cust_001 exists: ${u1?.exists?.() ? "YES" : "NO"}`);
      const p1 = await getDoc("Packages", "pkg_gold");
      log(`Packages/pkg_gold exists: ${p1?.exists?.() ? "YES" : "NO"}`);
      log("✅ Check done.");
    } catch (e) {
      setError(String(e?.message || e));
      log(`❌ Error: ${String(e?.message || e)}`);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Firestore Seeder</h1>
      <p style={{ opacity: 0.85 }}>
        Edit <b>seedPlan</b> in this file, then click Run Seed.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={runSeed}
          disabled={running}
          style={{ padding: "10px 14px", borderRadius: 8 }}
        >
          {running ? "Seeding..." : "Run Seed"}
        </button>

        <button
          onClick={checkDoc}
          disabled={running}
          style={{ padding: "10px 14px", borderRadius: 8 }}
        >
          Quick Check
        </button>
      </div>

      {error && <p style={{ color: "tomato", marginTop: 12 }}>{error}</p>}

      <pre
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          background: "#111",
          color: "#0f0",
          maxHeight: 420,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {logs.join("\n")}
      </pre>
    </div>
  );
}
