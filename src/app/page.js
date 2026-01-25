import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import HeroSection from "@/components/HeroSection";

export default function Home() {

  return (
    <main >
      <div>

        <Navbar />
        {/* Hero Section */}
        <HeroSection />

        {/* About Section */}
        <AboutSection />
        

      </div>
    </main>
  );
}
