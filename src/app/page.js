import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import HeroSection from "@/components/HeroSection";
import DecorSection from "@/components/DecorSection";
import ClientReviewSection from "@/components/ClientReviewSection";

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

      </div>
    </main>
  );
}
