"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

import { useRouter, useSearchParams } from "next/navigation";
import { getOriginFromSearchParams } from "@/utils/navigation";
import { ArrowIcon } from "@/components/sub-components/ArrowButton";


export default function Login() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = getOriginFromSearchParams(searchParams);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { user, login, logout, loading, role, profileLoading } = useAuth();

    // Auto redirect kalau sudah login
    useEffect(() => {
        if (loading) return;
        if (!user) return; // kalau blm login, jangan redirect
        if (profileLoading) return; // tunggu sampai profile tidak loading

        if (role === "admin") {
            console.log("Redirecting to admin dashboard");

            router.push("/admin-dashboard");
            return;
        }
        console.log("Redirecting to:", nextPath || "/");
        router.replace(nextPath || "/"); // redirect ke nextPath atau home
        
    }, [user, loading, router, nextPath, profileLoading, role]);

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    
    
    return (
        <div className="w-screen h-screen py-20 px-60 relative bg-linear-to-bl from-violet-300 to-fuchsia-300">

             {/* Background image layer */}
            <img
            className="absolute inset-0 w-full h-full object-center blur-xs opacity-80 pointer-events-none select-none z-0"
            src="/web-images/auth.jpg"
            alt=""
            draggable={false}
            />

            <div className="flex flex-row w-full h-full bd-4 z-10 relative">
                <div className="glassmorphism-2 w-2/3 h-full rounded-lg flex flex-col justify-center items-start gap-2 pl-4">
                    <p className="text-2xl bold">Sign in your Account</p>
                    <p className="">Join our comunity and start your story today!</p>
                </div>
                <div className="bg-gray-50 w-full h-full rounded-lg p-8 flex flex-col justify-between">
                    <button className="flex flex-row gap-2" onClick={() => router.replace(nextPath || "/")}>
                        <ArrowIcon cls={"w-5 h-5"} />
                        <p className="text-sm">Back</p>
                    </button>
                    <div className="flex flex-col gap-8 h-full pt-14">
                        <div className="flex flex-col gap-2">
                            <p className="bold text-sm">Email</p>
                            <input className="px-2 py-2 bd-6 w-70 rounded-lg outline-0"
                            type="email" name="email" id="1" placeholder="Your email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="bold text-sm">Password</p>
                            <input className="px-2 py-2 bd-6 rounded-lg w-70 outline-0"
                            type="password" name="password" id="2" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                        </div>

                    </div>

                     <div className="flex flex-col items-center gap-2">
                        <button className="bg-emerald-500 text-white px-4 py-2 rounded w-50" onClick={handleLogin}>Sign In</button>
                        
                        <p>Don't have an account?  
                        <Link
                            href={`/register${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
                            >
                            <span className="underline text-blue-500">{" click here to register"}</span>
                        </Link>
                    </p>
                </div> *

                </div>

            </div>
      
        </div>
    )
}