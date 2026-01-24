"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await register({ email, password, displayName: name });
            router.push("/login");
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };


    return (
        <div className="container mx-auto py-20">
            <h1>Register Page</h1>
            <div className="flex flex-col gap-4">
                <input type="text" name="name" id="1" placeholder="Username" onChange={(e) => setName(e.target.value)} />
                <input type="email" name="email" id="2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" name="password" id="3" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <input type="password" name="password" id="4" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex-col gap-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleRegister}>Sign Up</button>
                <p>Already have an account? <Link href="/login">click here to login</Link></p>
            </div>
        </div>
    )
}