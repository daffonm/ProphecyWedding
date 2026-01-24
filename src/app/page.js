import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";

export default function Home() {

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Packages', href: '#' },
    { name: 'Vendors', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <main >
      <div>

        <Navbar links={navLinks} />
        {/* Hero Section */}
        <div className="bg-gray-100 py-30 h-svh">
          <div className="container mx-auto text-center">
            <p>your</p>
            <h1 className="hero-title text-6xl">Wedding<br />Agency</h1>
            <p className="text-xl text-gray-700">We will help to tell your love story</p>
          </div>
        </div>

        {/* About Section */}
        <AboutSection />
        

      </div>
    </main>
  );
}
