"use client"
import LoadingSkeleton from "./LoadingSkeleton";
import Overlay from "./Overlay";
import MyBookList from "./MyBookList";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useDoc } from "@/hooks/useDoc";

function AccountMenu({ onClose }) {
  const [activeTab, setActiveTab] = useState(null);

  const { logout} = useAuth();

  const menuList = [
    { key: "profile", label: "Profile Details" },
    { key: "booklist", label: "My BookList" },
    { key: "memories", label: "Memories" },
  ];

  const isExpanded = activeTab !== null;

  return (
    <div
      className={[
        "h-full bg-white",
        "transition-[width] duration-300 ease-out",
        isExpanded ? "w-720px" : "w-80",
      ].join(" ")}
    >
      <div className="h-full flex">
        {/* LEFT: MENU COLUMN */}
        <div className="w-80 border-r border-gray-200 p-4 flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between">
            {isExpanded ? (
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setActiveTab(null)}
              >
                ← Back
              </button>
            ) : (
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>

          {/* Profile summary */}
          <div className="mt-4 p-4 flex gap-4 border-b border-gray-200">
            <Image
              src="/icons/icons8-customer-50.png"
              width={30}
              height={30}
              alt="Profile"
            />
            <div className="flex flex-col">
              <span className="font-medium">Username</span>
              <span className="text-sm text-gray-500">User Email</span>
            </div>
          </div>

          {/* Menu list */}
          <div className="mt-4 flex flex-col gap-2">
            {menuList.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={[
                  "text-left p-2 rounded-md",
                  "hover:bg-gray-100",
                  activeTab === item.key ? "bg-gray-100 font-medium" : "",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom logout */}
          <div className="mt-auto pt-6">
            <button className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
            onClick={
                () => {
                    logout();
                    onClose();
                }
            }>
              Logout
            </button>
          </div>
        </div>

        {/* RIGHT: DETAIL COLUMN */}
        {isExpanded && (
            <div className="w-lvh">

                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === "profile" && (
                    <div>
                        <h2 className="text-lg font-semibold">Profile Details</h2>
                        <p className="mt-2 text-sm text-gray-600">
                        Place your profile settings form here.
                        </p>
                    </div>
                    )}

                    {activeTab === "booklist" && ( <MyBookList />)}

                    {activeTab === "memories" && (
                    <div>
                        <h2 className="text-lg font-semibold">Memories</h2>
                        <p className="mt-2 text-sm text-gray-600">
                        Gallery / saved moments content here.
                        </p>
                    </div>
                    )}
                </div>

            </div>
        )}
      </div>
    </div>
  );
}


export default function Navbar() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
   
    const { user, userDoc, role, loading, profileLoading } = useAuth();
   
 
    
    const navigateVendor = () => {
        if (role === "vendor") {
          router.replace("/vendor-hub");
          return;
        } else if (role === "vendor-pending") {
          router.replace("/vendor-registration");
          return;
        }
        router.push("/vendor-page");
      };


    const navLinks = [
    { name: 'Home', navigate: () => router.push('/')},
    { name: 'About Us', navigate: () => router.push('/about')},
    { name: 'Packages', navigate: () => router.push('/packagelisting') },
    { name: 'Vendors', navigate: () => navigateVendor() },
    { name: 'Contact', navigate: () => router.push('/contact') },
  ];
 

    return <nav className="bg-white shadow-md py-4 px-4 absolute w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Prophecy Wedding</h1>
            <ul className="flex space-x-6">
                {navLinks.map((link, index) => (
                    <button
                    key={index}
                    onClick={link.navigate}
                    >{link.name}</button>
                ))}
            </ul>

                <div className="w-65 flex justify-end items-center">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : user ? (
                        <div className="flex flex-row items-center gap-8">
                          {!profileLoading && <p className="text-sm">{"Welcome, " + userDoc.username}</p>}
                        <button className=" bg-gray-200 border-black p-2 rounded-full hover:bg-gray-200" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Image
                                src="/icons/icons8-customer-50.png"
                                width={24}
                                height={24}
                                alt="Profile"
                                />

                        </button>
                        </div>
                    ) : (
                        <div className="flex flex-row items-center gap-8">
                        <Link href="/register">Sign Up</Link>
                        <Link href="/login" className="button1">Sign In</Link>
                        </div>
                    )}
                    </div>

            {isMenuOpen && 
                <Overlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                contentClassName="absolute top-0 right-0 h-screen bg-white shadow-xl p-4"
                >
                    <AccountMenu onClose={() => setIsMenuOpen(false)} />
                </Overlay>

            }

      

        </div>
    </nav>;
}