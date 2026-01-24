"use client";
import { Button1 } from "./Button.jsx";

export default function AboutSection() {
    return (
        <section className="h-screen flex flex-col justify-center items-center bg-white pl-10 pr-10 py-20">
                  <div className="w-screen flex flex-row justify-center items-center text-center">
                    <h2 className="section-title text-4xl mb-6">About Us</h2>
                    <div>
                      <p className="max-w-4xl text-lg text-gray-600 align-left">
                        At Prophecy Wedding Agency, we believe that every love story is unique and deserves to be celebrated in a way that reflects the couple's personality and style. Our dedicated team of wedding planners is committed to making your dream wedding a reality, from intimate gatherings to grand celebrations.
                      </p>
                      <Button1 onClick={() => alert('Learn More clicked!')}>Learn More</Button1>
                    </div>
                  </div>
                  {/* Photo Gallery */}
                  <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-200 h-128 rounded-lg"></div>
                      <div className="bg-gray-200 h-128 rounded-lg"></div>
                      <div className="bg-gray-200 h-128 rounded-lg"></div>
                    </div>
                  </div>
        
                </section>
    )
}