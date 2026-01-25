"use client"

import { useRouter } from "next/navigation"

export default function HeroSection() {
    const router = useRouter();

    return (
        <div className="bg-gray-100 py-40 h-svh">
          <div className="container mx-auto text-center">
            <p>your</p>
            <h1 className="hero-title text-6xl">Wedding<br />Agency</h1>
            <p className="text-xl text-gray-700">We will help to tell your love story</p>
            <button className="button1 mt-8" onClick={() => router.push("/booking")}>Make Reservation</button>
          </div>
        </div>
    )
}
