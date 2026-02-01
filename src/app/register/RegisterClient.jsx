"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOriginFromSearchParams } from "@/utils/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, user, loading, authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getOriginFromSearchParams(searchParams);

  // Auto redirect kalau sudah login (ini akan kepakai setelah register sukses juga)
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    router.replace(nextPath || "/");
  }, [user, loading, router, nextPath]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await register({ email, password, username: name });
      // Jangan router.push("/login")
      // Karena register() kamu sudah auto-login via Firebase Auth.
      // useEffect di atas akan redirect.
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-20">
      <h1>Register Page</h1>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Username"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="flex-col gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleRegister}
          disabled={authLoading}
        >
          Sign Up
        </button>
        <p>
          Already have an account? 
          <Link href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
            click here to login
            </Link>

        </p>
      </div>
    </div>
  );
}
