"use client"

import { useRouter } from "next/navigation"

export default function HeroSection() {
    const router = useRouter();

    return (
        <div className="py-40 h-svh relative bg-transparent ">
          <img className="absolute opacity-80 background-z w-screen"
           src="/web-images/heroBg.jpeg" alt="" />
          <div className="container mx-auto text-center bg-transparent">
            <p className="bold">your</p>
            <p className="hero-title text-6xl">Wedding<br />Agency</p>
            <p className="text-xl text-black bold">We will help to tell your love story</p>
            <button className="bold button1 mt-8" onClick={() => router.push("/booking")}>Make Reservation</button>
          </div>
        </div>
    )
}
