"use client";
import { Button1 } from "./Button.jsx";

export default function AboutSection() {
    return (
        <section className="h-screen flex flex-col justify-center items-center bg-white pl-10 pr-10 py-20 mt-14">

                  <div className="w-screen flex flex-row justify-center gap-20 items-center mx-auto">
                    <h2 className="section-title text-6xl mb-6">About Us</h2>
                    <div className="w-200 gap-8">
                      <p className="max-w-4xl text-lg text-gray-600 align-left">
                        At Prophecy Wedding Agency, we believe that every love story is unique and deserves to be celebrated in a way that reflects the couple's personality and style. Our dedicated team of wedding planners is committed to making your dream wedding a reality, from intimate gatherings to grand celebrations.
                      </p>
                      <button className="button1 mt-10" onClick={() => alert('Learn More clicked!')}>Learn More</button>
                    </div>
                  </div>
                  {/* Photo Gallery */}
                  <div className="container mx-auto mt-34 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-200 h-128  rounded-lg translate-y-20">
                        <img className="w-full h-full" src="/web-images/gelar.jpeg" alt="" />
                      </div>
                      <div className="bg-gray-200 h-128 rounded-lg">
                        <img className="w-full h-full" src="/web-images/home.jpeg" alt="" />

                      </div>
                      <div className="bg-gray-200 h-128 rounded-lg translate-y-20">
                        <img className="w-full h-full" src="/web-images/home2.jpeg" alt="" />
                      </div>
                    </div>
                  </div>
        
                </section>
    )
}