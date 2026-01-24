"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase-config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";


const AuthContext = createContext(null);

function mapAuthError(code) {
    switch (code) {
        case "auth/invalid-credential":
            return "Email atau password salah, atau akun belum terdaftar.";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Silakan login.";
    case "auth/weak-password":
      return "Password terlalu lemah. Minimal 6 karakter.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/missing-password":
      return "Password wajib diisi.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case "auth/network-request-failed":
      return "Koneksi bermasalah. Cek internet kamu.";
    default:
      return "Terjadi kesalahan. Coba lagi.";
  }
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}


export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

  // loading: status user sedang ditentukan (awal app)
  const [loading, setLoading] = useState(true);

  // authLoading: sedang proses login/register/logout
  const [authLoading, setAuthLoading] = useState(false);

  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Optional: bikin session cookie (kalau lu pakai /api/session)
  // Kalau belum pakai, biarin aja ignore.
  const createSession = async (idToken) => {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      // Kalau lu belum bikin endpoint ini, biasanya 404. Kita ignore supaya gak ganggu client-only.
      if (!res.ok) {
        // Uncomment kalau lu mau strict (wajib session)
        // throw new Error("SESSION_FAILED");
      }
    } catch {
      // ignore
    }
  };

  const destroySession = async () => {
    try {
      await fetch("/api/session", { method: "DELETE" });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    try {
      const e = normalizeEmail(email);
      const cred = await signInWithEmailAndPassword(auth, e, password);

      // Optional session cookie
      const token = await cred.user.getIdToken();
      await createSession(token);
    } catch (err) {
      console.error("LOGIN ERROR:", err?.code, err?.message);
      setError(mapAuthError(err?.code));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async ({ email, password, displayName }) => {
    setAuthLoading(true);
    setError(null);
    try {
      const e = normalizeEmail(email);
      const cred = await createUserWithEmailAndPassword(auth, e, password);

      if (displayName && displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }

      // Optional session cookie
      const token = await cred.user.getIdToken();
      await createSession(token);
    } catch (err) {
      console.error("REGISTER ERROR:", err?.code, err?.message);
      setError(mapAuthError(err?.code));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      await signOut(auth);
      await destroySession(); // optional
    } catch (err) {
      console.error("LOGOUT ERROR:", err?.code, err?.message);
      setError("Gagal logout. Coba lagi.");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, loading, authLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() harus dipakai di dalam <AuthProvider>.");
  return ctx;
}
