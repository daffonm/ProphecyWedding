"use client"

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {

    const { user, loading, logout} = useAuth();

    const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#' },
    { name: 'Packages', href: '/packagelisting' },
    { name: 'Vendors', href: '#' },
    { name: 'Contact', href: '#' },
  ];

    return <nav className="bg-white shadow-md py-4 px-6 absolute w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Prophecy Wedding</h1>
            <ul className="flex space-x-6">
                {navLinks.map((link, index) => (
                    <li key={index}>
                        <Link href={link.href} className="hover:text-gray-700">{link.name}</Link>
                    </li>
                ))}
            </ul>
                { loading ? <p>Loading...</p> : user ? (
            <div className="flex flex-row items-center gap-8">
                <span>Welcome, {user.displayName || user.email}</span> 
                <button onClick={() => logout()}>Sign Out</button>
            </div>
        ) : (       
            <div className="flex flex-row items-center gap-8">
                <Link href="/register">Sign Up</Link>
                <Link href="/login" className="button1">Sign In</Link>
            </div>
        )}

        </div>
    </nav>;
}