"use client";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function VendorSectionCTA() {
  const router = useRouter();

  return (
    <div> 
        <Navbar />
        <button
        onClick={() => router.push("/vendor-registration")}
        className="mt-28 px-4 py-2 rounded-lg bg-emerald-600 text-white"
        >
        Join Us
        </button>
    </div>
  );
}
