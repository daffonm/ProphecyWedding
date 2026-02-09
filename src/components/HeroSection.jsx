"use client"

import { useRouter } from "next/navigation"

export default function HeroSection() {
    const router = useRouter();

    return (
        <div className="py-40 h-svh relative bg-transparent ">
          <img className="absolute opacity-80 background-z w-screen"
           src="/web-images/heroBg.jpeg" alt="" />
          <div className="container mx-auto text-center bg-transparent">
            <div className="flex flex-col gap-4">
              <p className="bold">your</p>
              <p className="hero-title text-7xl">Wedding<br />Agency</p>
              <p className="text-xl text-black bold">We will help to tell your love story</p>

            </div>
            <button className="bold button1 mt-8" onClick={() => router.push("/booking")}>Make Reservation</button>
          </div>
        </div>
    )
}
