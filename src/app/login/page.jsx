"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

import { useRouter, useSearchParams } from "next/navigation";
import { getOriginFromSearchParams } from "@/utils/navigation";


export default function Login() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = getOriginFromSearchParams(searchParams);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { user, login, logout, loading } = useAuth();

    // Auto redirect kalau sudah login
    useEffect(() => {
        if (loading) return;
        if (!user) return; // kalau blm login, jangan redirect
        router.replace(nextPath || "/"); // redirect ke nextPath atau home
        
    }, [user, loading, router, nextPath]);

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    return (
        <div className="container mx-auto py-20">
            <h1>Login Page</h1>
            <div className="flex flex-col gap-4">
                <input type="email" name="email" id="1" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" name="password" id="2" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            </div>
                <div className="flex-col gap-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>Sign In</button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogout}>Sign Out</button>
                    <p>Don't have an account? 
                        <Link
                            href={`/register${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
                            >
                            click here to register
                            </Link>
                    </p>
                </div>
        </div>
    )
}