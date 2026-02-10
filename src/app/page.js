import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import HeroSection from "@/components/HeroSection";
import DecorSection from "@/components/DecorSection";
import ClientReviewSection from "@/components/ClientReviewSection";

import DevTools from "./dev/DevTools";

export default function Home() {

  return (
    <main >
      <div>

        <Navbar />
        {/* Hero Section */}
        <HeroSection />

        {/* About Section */}
        <AboutSection />
        <DecorSection />
        <ClientReviewSection />

        {/* Dev Tools */}
        <DevTools />

      </div>
    </main>
  );
}
