"use client"
import { useRouter } from "next/navigation"

export default function DecorSection({}) {
    const router = useRouter();


    return (
        <div className="w-screen h-228 relative mt-80 flex flex-col justify-center items-center bg-linear-to-b from-white-100 to-fuchsia-100">

            <img src="/web-images/faja.jpeg" alt="" className="absolute inset-0 w-full h-full object-center blur-x opacity-30 pointer-events-none select-none z-0"/>

            <div className="flex flex-col items-center justify-center gap-4 -translate-y-48">
                <p className="text-5xl">Your perfect</p>
                <h1 className="text-8xl section-title">Wedding</h1>
                <p className="text-4xl">Will come True</p>
                <button className="button1 mt-4" onClick={() => router.push("/packagelisting")}>See our pricelist</button>
            </div>
        </div>
    )
} 